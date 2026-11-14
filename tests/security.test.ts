import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type http from 'node:http';
import { createApiApp } from '../server/createApp.js';
import {
  AUTHORIZED_ADMIN_EMAIL,
  firebaseProjectConfig,
  verifyFirebaseIdToken,
} from '../server/authMiddleware.js';

function toBase64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const TEST_KID = 'test-key-1';

function signMockFirebaseJwt(
  claims: Record<string, any>,
  overrides: { header?: Record<string, any>; tamperPayload?: Record<string, any> } = {}
): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const projectId = firebaseProjectConfig.projectId;
  const header = {
    alg: 'RS256',
    kid: TEST_KID,
    typ: 'JWT',
    ...(overrides.header || {}),
  };
  const payload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    auth_time: nowSec - 60,
    iat: nowSec - 60,
    exp: nowSec + 3600,
    sub: 'uid_default',
    email: 'customer@example.com',
    email_verified: true,
    ...claims,
  };

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${headerB64}.${payloadB64}`);
  signer.end();
  const sigB64 = toBase64Url(signer.sign(privateKey));

  if (overrides.tamperPayload) {
    const tamperedB64 = toBase64Url(JSON.stringify({ ...payload, ...overrides.tamperPayload }));
    return `${headerB64}.${tamperedB64}.${sigB64}`;
  }
  return `${headerB64}.${payloadB64}.${sigB64}`;
}

const certProvider = async () => ({ [TEST_KID]: publicPem });

let server: http.Server;
let baseUrl = '';
let tempDir = '';

before(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'noorstudio-sec-test-'));
  const app = createApiApp({
    dataDir: tempDir,
    tokenVerifier: (token) => verifyFirebaseIdToken(token, certProvider),
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

async function api(
  method: string,
  route: string,
  options: { token?: string; body?: unknown } = {}
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

test('Scenario 1 & 7: Cryptographic RS256 verification and authorized admin access', async () => {
  const adminToken = signMockFirebaseJwt({
    sub: 'admin_uid_001',
    email: AUTHORIZED_ADMIN_EMAIL,
    email_verified: true,
    admin: true,
  });

  const verifyRes = await api('POST', '/api/auth/verify-admin', { token: adminToken });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.json.authorized, true);
  assert.equal(verifyRes.json.role, 'admin');

  const verifyGetRes = await api('GET', '/api/auth/verify-admin', { token: adminToken });
  assert.equal(verifyGetRes.status, 200);
  assert.equal(verifyGetRes.json.authorized, true);

  // Tampered payload rejected
  const tampered = signMockFirebaseJwt(
    { sub: 'cust_1', email: 'customer@example.com', email_verified: true },
    { tamperPayload: { email: AUTHORIZED_ADMIN_EMAIL, admin: true } }
  );
  await assert.rejects(
    () => verifyFirebaseIdToken(tampered, certProvider),
    /Invalid authentication token signature/
  );

  // Expired token rejected
  const expired = signMockFirebaseJwt({
    sub: 'admin_uid_001',
    email: AUTHORIZED_ADMIN_EMAIL,
    exp: Math.floor(Date.now() / 1000) - 10,
  });
  await assert.rejects(() => verifyFirebaseIdToken(expired, certProvider), /expired/);

  // Wrong audience rejected
  const wrongAud = signMockFirebaseJwt({
    sub: 'admin_uid_001',
    email: AUTHORIZED_ADMIN_EMAIL,
    aud: 'wrong-firebase-project',
  });
  await assert.rejects(() => verifyFirebaseIdToken(wrongAud, certProvider), /audience mismatch/);

  // alg=none rejected
  const unsigned = signMockFirebaseJwt(
    { sub: 'admin_uid_001', email: AUTHORIZED_ADMIN_EMAIL },
    { header: { alg: 'none' } }
  );
  await assert.rejects(() => verifyFirebaseIdToken(unsigned, certProvider), /Unsupported token algorithm/);
});

test('Scenario 2 & 3: Ordinary customers and unauthorized emails cannot access admin endpoints', async () => {
  const customerToken = signMockFirebaseJwt({
    sub: 'cust_uid_a',
    email: 'ayesha@example.com',
    email_verified: true,
  });

  // Unauthorized email even with spoofed custom admin claim
  const rogueClaimToken = signMockFirebaseJwt({
    sub: 'rogue_uid',
    email: 'hacker@gmail.com',
    email_verified: true,
    admin: true,
    role: 'admin',
  });

  // Unverified admin email without custom claim must fail
  const unverifiedAdminToken = signMockFirebaseJwt({
    sub: 'admin_unverified',
    email: AUTHORIZED_ADMIN_EMAIL,
    email_verified: false,
  });

  for (const token of [customerToken, rogueClaimToken, unverifiedAdminToken]) {
    const verifyRes = await api('POST', '/api/auth/verify-admin', { token });
    assert.equal(verifyRes.status, 403);
    assert.equal(String(verifyRes.json.error || '').includes(AUTHORIZED_ADMIN_EMAIL), false);

    const listOrdersRes = await api('GET', '/api/orders', { token });
    assert.equal(listOrdersRes.status, 403);

    const customersRes = await api('GET', '/api/admin/customers', { token });
    assert.equal(customersRes.status, 403);

    const emailsRes = await api('GET', '/api/emails', { token });
    assert.equal(emailsRes.status, 403);
  }
});

test('Scenario 4, 5 & 6: Customer privacy isolation, anti-spoofing, and anti-role-escalation', async () => {
  const tokenA = signMockFirebaseJwt({
    sub: 'customer_a_uid',
    email: 'customer.a@example.com',
    email_verified: true,
  });
  const tokenB = signMockFirebaseJwt({
    sub: 'customer_b_uid',
    email: 'customer.b@example.com',
    email_verified: true,
  });
  const adminToken = signMockFirebaseJwt({
    sub: 'admin_uid_001',
    email: AUTHORIZED_ADMIN_EMAIL,
    email_verified: true,
  });

  // Customer A tries to escalate role to 'admin' via /api/auth/profile
  const profileARes = await api('POST', '/api/auth/profile', {
    token: tokenA,
    body: {
      name: 'Ayesha Khan',
      phone: '03001112233',
      role: 'admin',
      address: 'House 10, Gulberg',
      city: 'Lahore',
    },
  });
  assert.equal(profileARes.status, 200);
  assert.equal(profileARes.json.profile.role, 'customer');
  assert.equal(profileARes.json.profile.uid, 'customer_a_uid');

  // Customer B creates profile
  const profileBRes = await api('POST', '/api/auth/profile', {
    token: tokenB,
    body: {
      name: 'Fatima Ali',
      phone: '03219998877',
      role: 'admin',
      address: 'Street 5, Clifton',
      city: 'Karachi',
    },
  });
  assert.equal(profileBRes.status, 200);
  assert.equal(profileBRes.json.profile.role, 'customer');

  // Customer A places an order trying to pre-approve orderStatus='Delivered'
  const orderARes = await api('POST', '/api/orders', {
    token: tokenA,
    body: {
      id: 'ord_cust_a_1',
      orderNumber: 'NS-2026-10001',
      userId: 'customer_a_uid',
      orderStatus: 'Delivered',
      paymentStatus: 'Paid',
      customer: {
        fullName: 'Ayesha Khan',
        phone: '03001112233',
        email: 'customer.a@example.com',
        address: 'House 10, Gulberg',
        city: 'Lahore',
      },
      items: [{ productId: 'p1', productName: 'Chiffon Suit', price: 12500, quantity: 1 }],
      subtotal: 12500,
      total: 12500,
    },
  });
  assert.equal(orderARes.status, 201);

  // Customer B places an order
  const orderBRes = await api('POST', '/api/orders', {
    token: tokenB,
    body: {
      id: 'ord_cust_b_1',
      orderNumber: 'NS-2026-10002',
      userId: 'customer_b_uid',
      customer: {
        fullName: 'Fatima Ali',
        phone: '03219998877',
        email: 'customer.b@example.com',
        address: 'Street 5, Clifton',
        city: 'Karachi',
      },
      items: [{ productId: 'p2', productName: 'Lawn Suit', price: 8500, quantity: 1 }],
      subtotal: 8500,
      total: 8500,
    },
  });
  assert.equal(orderBRes.status, 201);

  // Customer A cannot place an order under Customer B's UID
  const spoofOrderRes = await api('POST', '/api/orders', {
    token: tokenA,
    body: {
      userId: 'customer_b_uid',
      customer: {
        fullName: 'Spoofer',
        phone: '03001112233',
        email: 'customer.a@example.com',
        address: 'Lahore',
        city: 'Lahore',
      },
      items: [{ productId: 'p1', productName: 'Suit', price: 5000, quantity: 1 }],
      subtotal: 5000,
      total: 5000,
    },
  });
  assert.equal(spoofOrderRes.status, 403);

  // Customer A cannot overwrite Customer B's existing order ID/number
  const overwriteRes = await api('POST', '/api/orders', {
    token: tokenA,
    body: {
      id: 'ord_cust_b_1',
      orderNumber: 'NS-2026-10002',
      customer: {
        fullName: 'Ayesha Khan',
        phone: '03001112233',
        email: 'customer.a@example.com',
        address: 'Lahore',
        city: 'Lahore',
      },
      items: [{ productId: 'p1', productName: 'Suit', price: 1, quantity: 1 }],
      subtotal: 1,
      total: 1,
    },
  });
  assert.equal(overwriteRes.status, 409);

  // Customer A's /api/my-orders only contains Order A and forced status Pending
  const myOrdersARes = await api('GET', '/api/my-orders', { token: tokenA });
  assert.equal(myOrdersARes.status, 200);
  assert.equal(myOrdersARes.json.orders.length, 1);
  assert.equal(myOrdersARes.json.orders[0].id, 'ord_cust_a_1');
  assert.equal(myOrdersARes.json.orders[0].orderStatus, 'Pending');

  // Customer A cannot view Customer B's single order
  const getOrderBAsA = await api('GET', '/api/orders/ord_cust_b_1', { token: tokenA });
  assert.equal(getOrderBAsA.status, 403);

  // Customer A cannot update Customer A's or Customer B's order status
  const patchOrderAsA = await api('PATCH', '/api/orders/ord_cust_a_1', {
    token: tokenA,
    body: { orderStatus: 'Delivered' },
  });
  assert.equal(patchOrderAsA.status, 403);

  // Customer A cannot delete any order
  const delOrderAsA = await api('DELETE', '/api/orders/ord_cust_a_1', { token: tokenA });
  assert.equal(delOrderAsA.status, 403);

  // Authorized Admin CAN view all orders, all customers, and update order status
  const adminOrdersRes = await api('GET', '/api/orders', { token: adminToken });
  assert.equal(adminOrdersRes.status, 200);
  assert.equal(adminOrdersRes.json.orders.length, 2);

  const adminPatchRes = await api('PATCH', '/api/orders/ord_cust_a_1', {
    token: adminToken,
    body: { orderStatus: 'Confirmed', trackingNumber: 'PE-998877' },
  });
  assert.equal(adminPatchRes.status, 200);
  assert.equal(adminPatchRes.json.order.orderStatus, 'Confirmed');

  const adminCustomersRes = await api('GET', '/api/admin/customers', { token: adminToken });
  assert.equal(adminCustomersRes.status, 200);
  assert.equal(adminCustomersRes.json.customers.length, 2);
});

test('Scenario 8: Unauthenticated / logged-out callers blocked & tracking sanitized', async () => {
  for (const [method, route] of [
    ['GET', '/api/auth/verify-admin'],
    ['POST', '/api/auth/verify-admin'],
    ['GET', '/api/auth/profile'],
    ['POST', '/api/auth/profile'],
    ['GET', '/api/my-orders'],
    ['GET', '/api/orders'],
    ['GET', '/api/orders/ord_cust_a_1'],
    ['PATCH', '/api/orders/ord_cust_a_1'],
    ['DELETE', '/api/orders/ord_cust_a_1'],
    ['GET', '/api/admin/customers'],
    ['GET', '/api/emails'],
  ] as const) {
    const res = await api(method, route);
    assert.equal(res.status, 401, `Expected 401 for ${method} ${route}`);
  }

  // Health leaks no PII or internal counts
  const healthRes = await api('GET', '/api/health');
  assert.equal(healthRes.status, 200);
  assert.equal('ordersStored' in healthRes.json, false);
  assert.equal('emailsDispatched' in healthRes.json, false);

  // Order tracking requires matching phone and hides PII
  const badTrack = await api('POST', '/api/orders/track', {
    body: { orderNumber: 'NS-2026-10001', phone: '03990000000' },
  });
  assert.equal(badTrack.status, 403);

  const goodTrack = await api('POST', '/api/orders/track', {
    body: { orderNumber: 'NS-2026-10001', phone: '03001112233' },
  });
  assert.equal(goodTrack.status, 200);
  assert.equal(goodTrack.json.tracking.orderStatus, 'Confirmed');
  assert.equal('email' in goodTrack.json.tracking, false);
  assert.equal('address' in goodTrack.json.tracking, false);
});

test('Scenario 9 & 10: Zero admin links/demo accounts in storefront UI & strict Firestore rules', () => {
  const rootDir = path.resolve(process.cwd());
  const customerUiFiles = [
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/components/account/AuthModal.tsx',
    'src/components/account/CustomerDashboard.tsx',
  ];

  for (const relPath of customerUiFiles) {
    const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
    assert.equal(content.includes('sawaira'), false, `${relPath} must not contain legacy email`);
    assert.equal(content.includes(AUTHORIZED_ADMIN_EMAIL), false, `${relPath} must not expose admin email`);
    assert.equal(content.includes('signInAsAdminDemo'), false, `${relPath} must not have demo admin login`);
    assert.equal(content.includes('signInAsCustomerDemo'), false, `${relPath} must not have demo customer login`);
    assert.equal(/admin\s*(portal|login|dashboard)/i.test(content), false, `${relPath} must not link to admin portal`);
  }

  const rules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf-8');
  assert.equal(rules.includes(`request.auth.token.email == '${AUTHORIZED_ADMIN_EMAIL}'`), true);
  assert.equal(rules.includes('request.auth.token.email_verified == true'), true);
  assert.equal(rules.includes('match /users/{userId}'), true);
  assert.equal(rules.includes("incoming().role == 'customer'"), true);
  assert.equal(rules.includes('match /orders/{orderId}'), true);
  assert.equal(rules.includes('allow update: if isValidId(orderId) && isAdmin()'), true);

  const authModalCode = fs.readFileSync(path.join(rootDir, 'src/components/account/AuthModal.tsx'), 'utf-8');
  assert.equal(authModalCode.includes('auth/operation-not-allowed'), true);

  const adminLoginCode = fs.readFileSync(path.join(rootDir, 'src/components/admin/AdminLoginPage.tsx'), 'utf-8');
  assert.equal(adminLoginCode.includes('auth/operation-not-allowed'), true);
  assert.equal(adminLoginCode.includes('signInAdminWithGoogle'), true);
  assert.equal(adminLoginCode.includes(AUTHORIZED_ADMIN_EMAIL), false);
});

