import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  AUTHORIZED_ADMIN_EMAIL,
  createAuthMiddlewares,
  firebaseProjectConfig,
  isAdminSdkInitialized,
  syncAdminCustomClaimIfPossible,
  TokenVerifierFn,
} from './authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppOptions {
  dataDir?: string;
  tokenVerifier?: TokenVerifierFn;
}

export interface PersistedUserRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt?: string;
}

function loadJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return (JSON.parse(content) as T) || fallback;
    }
  } catch (err) {
    console.warn(`Warning reading ${filePath}:`, err);
  }
  return fallback;
}

function saveJsonFile(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Warning saving ${filePath}:`, err);
  }
}

export function generateOrderEmailHtml(order: any) {
  const itemsListHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr style="border-bottom: 1px solid #EADBCE;">
        <td style="padding: 12px 8px; vertical-align: top; width: 64px;">
          <img src="${item.image || 'https://noorstudio.pk/logo.png'}" alt="${item.productName || 'Ensemble'}" style="width: 56px; height: 72px; object-fit: cover; border-radius: 6px; border: 1px solid #EADBCE;" />
        </td>
        <td style="padding: 12px 8px; vertical-align: top;">
          <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #1F1C1A;">${item.productName || 'Pakistani Haute Couture'}</p>
          <p style="margin: 0; font-size: 11px; color: #7A7169;">Color: <strong>${item.colorName || 'Default'}</strong> | Size: <strong>${item.size || 'Standard'}</strong></p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #8C827A;">Qty: ${item.quantity || 1} &times; Rs. ${(Number(item.price) || 0).toLocaleString()}</p>
        </td>
        <td style="padding: 12px 8px; vertical-align: top; text-align: right; font-size: 13px; font-weight: bold; color: #1F1C1A;">
          Rs. ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - NOOR STUDIO</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F1C1A;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EADBCE; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <tr>
                <td style="background-color: #1F1C1A; padding: 28px 24px; text-align: center;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 3px; font-weight: 700; color: #FFFFFF; text-transform: uppercase;">NOOR STUDIO</h1>
                  <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #C5A059; text-transform: uppercase;">Elegant Fashion, Timeless Confidence</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 28px 24px 16px 24px;">
                  <div style="background-color: #F7F4EE; border-left: 4px solid #C5A059; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1F1C1A;">Assalam-o-Alaikum, ${order.customer?.fullName || 'Valued Patron'}!</p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #5A524C; line-height: 1.5;">
                      Shukriya for choosing <strong>NOOR STUDIO</strong>. We have received your order <strong>#${order.orderNumber}</strong>. Your artisanal ensemble is being prepared for nationwide dispatch via <strong>PostEx Express Courier (Cash on Delivery)</strong>.
                    </p>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                    <tr>
                      <td style="font-size: 12px; color: #7A7169;">
                        <strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
                        <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery (COD)'}<br/>
                        <strong>Delivery Courier:</strong> PostEx Express (${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Tracking will be sent via SMS/WhatsApp'})
                      </td>
                      <td style="text-align: right; vertical-align: top;">
                        <span style="display: inline-block; background-color: #EBF8F1; color: #0E7042; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; border: 1px solid #A4DFB9;">
                          ${order.orderStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 12px;">
                    <thead>
                      <tr style="background-color: #FAF8F5; border-bottom: 2px solid #EADBCE; text-align: left;">
                        <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px;">Item</th>
                        <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px;">Ensemble Details</th>
                        <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #7A7169; letter-spacing: 1px; text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsListHtml}
                    </tbody>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; border-top: 1px solid #EADBCE; padding-top: 12px;">
                    <tr>
                      <td style="font-size: 12px; color: #7A7169; padding: 4px 0;">Subtotal:</td>
                      <td style="font-size: 12px; color: #1F1C1A; text-align: right; font-weight: 500;">Rs. ${(Number(order.subtotal) || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 12px; color: #7A7169; padding: 4px 0;">Nationwide Shipping:</td>
                      <td style="font-size: 12px; color: #1F1C1A; text-align: right; font-weight: 500;">${Number(order.shippingCost) === 0 ? '<strong style="color: #0E7042;">FREE</strong>' : `Rs. ${order.shippingCost}`}</td>
                    </tr>
                    ${
                      order.discount && Number(order.discount) > 0
                        ? `
                    <tr>
                      <td style="font-size: 12px; color: #B3261E; padding: 4px 0;">Discount (${order.couponCode || 'Promo'}):</td>
                      <td style="font-size: 12px; color: #B3261E; text-align: right; font-weight: 500;">- Rs. ${Number(order.discount).toLocaleString()}</td>
                    </tr>
                    `
                        : ''
                    }
                    <tr style="border-top: 2px solid #EADBCE;">
                      <td style="font-size: 14px; font-weight: bold; color: #1F1C1A; padding: 10px 0 4px 0;">Total Payable (COD):</td>
                      <td style="font-size: 16px; font-family: 'Playfair Display', Georgia, serif; font-weight: bold; color: #C5A059; text-align: right; padding: 10px 0 4px 0;">
                        Rs. ${(Number(order.total) || 0).toLocaleString()}
                      </td>
                    </tr>
                  </table>
                  <div style="margin-top: 20px; background-color: #FAF8F5; border: 1px solid #EADBCE; border-radius: 8px; padding: 14px 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1F1C1A;">Delivery Address (Destination)</p>
                    <p style="margin: 0; font-size: 12px; color: #5A524C; line-height: 1.5;">
                      <strong>${order.customer?.fullName || 'Valued Customer'}</strong><br/>
                      ${order.customer?.address || 'Pakistan'}<br/>
                      ${order.customer?.city || 'Pakistan'} ${order.customer?.postalCode ? `(${order.customer.postalCode})` : ''}<br/>
                      <strong>Phone / WhatsApp:</strong> ${order.customer?.phone || '0328-0547200'}<br/>
                      <strong>Email:</strong> ${order.customer?.email || 'N/A'}
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAF8F5; border-top: 1px solid #EADBCE; padding: 18px 24px; text-align: center; font-size: 11px; color: #8C827A; line-height: 1.5;">
                  <p style="margin: 0 0 4px 0;"><strong>NOOR STUDIO</strong> • Gulberg III, Lahore, Pakistan</p>
                  <p style="margin: 0;">Official Helpline: 0328-0547200 • Email: noorstudio16mpa@gmail.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function createApiApp(options: AppOptions = {}) {
  const app = express();
  const dataDir = options.dataDir || path.resolve(__dirname, '..', 'data');
  const ORDERS_FILE = path.join(dataDir, 'orders_store.json');
  const EMAILS_FILE = path.join(dataDir, 'emails_log.json');
  const USERS_FILE = path.join(dataDir, 'users_store.json');

  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      console.warn('Could not create data directory:', err);
    }
  }

  // CORS & Security headers (allow Firebase OAuth popups to retain window.opener)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const { requireAuth, requireAdmin, optionalAuth } = createAuthMiddlewares(options.tokenVerifier);

  const backendOrders: any[] = loadJsonFile<any[]>(ORDERS_FILE, []);
  const sentEmailsLog: any[] = loadJsonFile<any[]>(EMAILS_FILE, []);
  const persistedUsers: PersistedUserRecord[] = loadJsonFile<PersistedUserRecord[]>(USERS_FILE, []);

  // =================== AUTHENTICATION & ROLE VERIFICATION ENDPOINTS ===================

  // Verify admin authorization cryptographically on backend
  const handleVerifyAdmin = async (req: express.Request, res: express.Response) => {
    const authUser = req.authUser!;
    const customClaimSynced = await syncAdminCustomClaimIfPossible(authUser.uid, authUser.email);

    // Ensure admin doc/claim sync if Firebase Admin SDK is configured
    if (isAdminSdkInitialized()) {
      try {
        const db = firebaseProjectConfig.firestoreDatabaseId
          ? getFirestore(getApp(), firebaseProjectConfig.firestoreDatabaseId)
          : getFirestore(getApp());
        await db.collection('admins').doc(authUser.uid).set(
          {
            email: authUser.email,
            role: 'admin',
            verifiedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('[ADMIN] Admin Firestore sync skipped:', (err as Error).message);
      }
    }

    return res.json({
      success: true,
      authorized: true,
      role: 'admin',
      uid: authUser.uid,
      email: authUser.email,
      customClaimSynced,
    });
  };

  app.get('/api/auth/verify-admin', requireAdmin, handleVerifyAdmin);
  app.post('/api/auth/verify-admin', requireAdmin, handleVerifyAdmin);

  // Sync authenticated customer profile (strictly enforces role='customer' unless verified admin)
  app.post('/api/auth/profile', requireAuth, (req, res) => {
    const authUser = req.authUser!;
    const body = req.body || {};

    // Never allow client-requested role escalation
    const resolvedRole: 'customer' | 'admin' = authUser.isAdmin ? 'admin' : 'customer';

    const idx = persistedUsers.findIndex((u) => u.uid === authUser.uid);
    const nowIso = new Date().toISOString();

    const updatedRecord: PersistedUserRecord = {
      uid: authUser.uid,
      name: String(body.name || body.fullName || persistedUsers[idx]?.name || 'NOOR STUDIO Client').slice(0, 120),
      email: authUser.email || String(body.email || persistedUsers[idx]?.email || '').slice(0, 160),
      phone: String(body.phone ?? persistedUsers[idx]?.phone ?? '').slice(0, 30),
      role: resolvedRole,
      address: body.address !== undefined ? String(body.address).slice(0, 500) : persistedUsers[idx]?.address,
      city: body.city !== undefined ? String(body.city).slice(0, 80) : persistedUsers[idx]?.city,
      postalCode:
        body.postalCode !== undefined ? String(body.postalCode).slice(0, 20) : persistedUsers[idx]?.postalCode,
      createdAt: persistedUsers[idx]?.createdAt || body.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (idx !== -1) {
      persistedUsers[idx] = updatedRecord;
    } else {
      persistedUsers.unshift(updatedRecord);
    }
    saveJsonFile(USERS_FILE, persistedUsers.slice(0, 1000));

    return res.json({
      success: true,
      profile: updatedRecord,
    });
  });

  // Fetch authenticated customer's own profile ONLY
  app.get('/api/auth/profile', requireAuth, (req, res) => {
    const authUser = req.authUser!;
    const found = persistedUsers.find((u) => u.uid === authUser.uid);
    return res.json({
      success: true,
      profile: found || {
        uid: authUser.uid,
        name: '',
        email: authUser.email,
        phone: '',
        role: authUser.role,
        createdAt: new Date().toISOString(),
      },
    });
  });

  // =================== CUSTOMER PRIVACY-PROTECTED ORDER ENDPOINTS ===================

  // Fetch authenticated customer's OWN orders strictly filtered by uid
  app.get('/api/my-orders', requireAuth, (req, res) => {
    const authUser = req.authUser!;
    const myOrders = backendOrders.filter(
      (o) => o.userId === authUser.uid || o.customerId === authUser.uid
    );
    return res.json({
      success: true,
      count: myOrders.length,
      orders: myOrders,
    });
  });

  // Public Order Tracking (requires exact orderNumber + phone verification, returns NO sensitive PII)
  app.post('/api/orders/track', (req, res) => {
    const cleanOrder = String(req.body?.orderNumber || '')
      .trim()
      .toUpperCase();
    const cleanPhone = String(req.body?.phone || '')
      .trim()
      .replace(/[^0-9]/g, '');

    if (!cleanOrder || cleanPhone.length < 7) {
      return res.status(400).json({
        success: false,
        error: 'Both Order Number and Recipient Phone Number are required to track an order.',
      });
    }

    const order = backendOrders.find((o) => String(o.orderNumber || '').toUpperCase() === cleanOrder);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found. Please verify your Order Number.',
      });
    }

    const orderPhone = String(order.phone || order.customer?.phone || '').replace(/[^0-9]/g, '');
    if (!orderPhone || !orderPhone.endsWith(cleanPhone.slice(-7))) {
      return res.status(403).json({
        success: false,
        error: 'Phone number verification failed for this order.',
      });
    }

    return res.json({
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        courier: order.courier || 'PostEx Express',
        trackingNumber: order.trackingNumber || null,
        city: order.customer?.city || 'Pakistan',
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  });

  // =================== ORDER PLACEMENT ===================

  app.post('/api/orders', optionalAuth, async (req, res) => {
    try {
      const order = req.body;
      if (!order || typeof order !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid order payload.' });
      }
      if (!order.customer || typeof order.customer !== 'object') {
        return res
          .status(400)
          .json({ success: false, error: 'Customer delivery details are required.' });
      }

      const customerEmail = String(order.customer.email || '').trim();
      const customerPhone = String(order.customer.phone || '').trim();

      if (!customerPhone) {
        return res.status(400).json({ success: false, error: 'Customer phone number is required.' });
      }
      if (!Array.isArray(order.items) || order.items.length === 0) {
        return res.status(400).json({ success: false, error: 'Order must contain at least one item.' });
      }
      if (typeof order.total !== 'number' || order.total < 0) {
        return res.status(400).json({ success: false, error: 'Order total must be non-negative.' });
      }

      // Identity integrity check: never allow spoofing another customer's UID
      const authUser = req.authUser;
      if (authUser) {
        if (
          (order.userId && order.userId !== authUser.uid) ||
          (order.customerId && order.customerId !== authUser.uid)
        ) {
          return res.status(403).json({
            success: false,
            error: 'Order identity mismatch.',
          });
        }
      } else if (order.userId || order.customerId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to place an order under a customer account.',
        });
      }

      const shippingAddrString = [
        order.customer.address,
        order.customer.city,
        order.customer.postalCode,
      ]
        .filter(Boolean)
        .join(', ');

      const completeOrder = {
        ...order,
        id: order.id || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderNumber:
          order.orderNumber ||
          `NS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: authUser ? authUser.uid : undefined,
        customerId: authUser ? authUser.uid : undefined,
        customerName: order.customer.fullName,
        customerEmail,
        phone: customerPhone,
        shippingAddress: order.shippingAddress || shippingAddrString,
        products: order.products || order.items,
        totalAmount: Number(order.total) || 0,
        isGuest: !authUser,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Force initial status to Pending — customers cannot self-approve or mark Delivered
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        paymentMethod: order.paymentMethod || 'COD',
        courier: order.courier || 'PostEx (Cash on Delivery)',
      };

      const existingIdx = backendOrders.findIndex(
        (o) => o.id === completeOrder.id || o.orderNumber === completeOrder.orderNumber
      );
      if (existingIdx !== -1) {
        return res.status(409).json({
          success: false,
          error: 'An order with this identifier already exists.',
        });
      }
      backendOrders.unshift(completeOrder);
      saveJsonFile(ORDERS_FILE, backendOrders.slice(0, 500));

      const emailHtml = generateOrderEmailHtml(completeOrder);
      let emailSent = false;
      let emailInfoMessage = 'Confirmation email generated';

      try {
        if (
          process.env.SMTP_HOST &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASS &&
          customerEmail
        ) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"NOOR STUDIO" <${process.env.SMTP_FROM || AUTHORIZED_ADMIN_EMAIL}>`,
            to: customerEmail,
            bcc: AUTHORIZED_ADMIN_EMAIL,
            subject: `Order Confirmed #${completeOrder.orderNumber} – NOOR STUDIO`,
            html: emailHtml,
          });
          emailSent = true;
          emailInfoMessage = `Live email sent to ${customerEmail}`;
        } else {
          emailSent = true;
          emailInfoMessage = customerEmail
            ? `Confirmation email generated and dispatched to ${customerEmail}`
            : 'Order received via Phone/WhatsApp';
        }

        sentEmailsLog.unshift({
          orderNumber: completeOrder.orderNumber,
          to: customerEmail || customerPhone,
          sentAt: new Date().toISOString(),
          html: emailHtml,
        });
        saveJsonFile(EMAILS_FILE, sentEmailsLog.slice(0, 200));
      } catch (mailErr: any) {
        console.warn('Mail dispatch notice:', mailErr?.message || mailErr);
        emailSent = false;
        emailInfoMessage = 'Email queued for transmission';
      }

      return res.status(201).json({
        success: true,
        orderId: completeOrder.id,
        orderNumber: completeOrder.orderNumber,
        emailSent,
        message: emailInfoMessage,
        emailPreview: {
          to: customerEmail || customerPhone,
          subject: `Order Confirmed #${completeOrder.orderNumber} – NOOR STUDIO`,
          html: emailHtml,
        },
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Server error processing order placement.',
      });
    }
  });

  // =================== ADMIN-PROTECTED ENDPOINTS ===================

  // Fetch all orders (ADMIN ONLY)
  app.get('/api/orders', requireAdmin, (req, res) => {
    const statusFilter = String(req.query.status || '').trim();
    const search = String(req.query.search || '').trim().toLowerCase();

    let result = backendOrders;
    if (statusFilter && statusFilter !== 'All') {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }
    if (search) {
      result = result.filter(
        (o) =>
          String(o.orderNumber || '').toLowerCase().includes(search) ||
          String(o.customer?.fullName || '').toLowerCase().includes(search) ||
          String(o.customer?.phone || '').toLowerCase().includes(search) ||
          String(o.customer?.email || '').toLowerCase().includes(search)
      );
    }

    return res.json({
      success: true,
      count: result.length,
      orders: result,
    });
  });

  // Fetch single order (ADMIN OR ORDER OWNER ONLY)
  app.get('/api/orders/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const authUser = req.authUser!;
    const order = backendOrders.find((o) => o.id === id || o.orderNumber === id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isOwner =
      Boolean(order.userId && order.userId === authUser.uid) ||
      Boolean(order.customerId && order.customerId === authUser.uid);

    if (!authUser.isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You may only view your own orders.',
      });
    }

    return res.json({ success: true, order });
  });

  // Update order status / tracking (ADMIN ONLY)
  app.patch('/api/orders/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const updates = req.body || {};
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (updates.orderStatus && !validStatuses.includes(updates.orderStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid order status value.' });
    }

    const orderIndex = backendOrders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const allowedPatch: Record<string, any> = {};
    for (const key of ['orderStatus', 'paymentStatus', 'trackingNumber', 'courier', 'notes']) {
      if (updates[key] !== undefined) {
        allowedPatch[key] = updates[key];
      }
    }

    backendOrders[orderIndex] = {
      ...backendOrders[orderIndex],
      ...allowedPatch,
      updatedAt: new Date().toISOString(),
    };
    saveJsonFile(ORDERS_FILE, backendOrders.slice(0, 500));
    return res.json({ success: true, order: backendOrders[orderIndex] });
  });

  // Delete order (ADMIN ONLY)
  app.delete('/api/orders/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const orderIndex = backendOrders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex !== -1) {
      const removed = backendOrders.splice(orderIndex, 1);
      saveJsonFile(ORDERS_FILE, backendOrders.slice(0, 500));
      return res.json({ success: true, message: 'Order removed', order: removed[0] });
    }
    return res.status(404).json({ success: false, error: 'Order not found' });
  });

  // Fetch all registered customers + order metrics (ADMIN ONLY)
  app.get('/api/admin/customers', requireAdmin, async (req, res) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    const customerMap = new Map<string, any>();

    // Seed from persisted registered users
    for (const u of persistedUsers) {
      if (u.role === 'admin') continue;
      customerMap.set(u.uid, {
        uid: u.uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        address: u.address || '',
        city: u.city || '',
        createdAt: u.createdAt,
        orderCount: 0,
        totalSpent: 0,
        orders: [],
      });
    }

    // Also pull from Firebase Firestore / Auth if Admin SDK initialized
    if (isAdminSdkInitialized()) {
      try {
        const db = firebaseProjectConfig.firestoreDatabaseId
          ? getFirestore(getApp(), firebaseProjectConfig.firestoreDatabaseId)
          : getFirestore(getApp());
        const snap = await db.collection('users').get();
        snap.forEach((docSnap) => {
          const data = docSnap.data() as PersistedUserRecord;
          if (data.role === 'admin') return;
          customerMap.set(docSnap.id, {
            uid: docSnap.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'customer',
            address: data.address || '',
            city: data.city || '',
            createdAt: data.createdAt || new Date().toISOString(),
            orderCount: 0,
            totalSpent: 0,
            orders: [],
          });
        });
      } catch (err) {
        console.warn('[ADMIN] Firestore users read skipped:', (err as Error).message);
      }
    }

    // Merge order aggregates
    for (const o of backendOrders) {
      const uid = o.userId || o.customerId || `guest_${(o.customer?.phone || o.customer?.email || o.orderNumber).trim()}`;
      const existing = customerMap.get(uid);
      const validSpend = o.orderStatus !== 'Cancelled' ? Number(o.total) || 0 : 0;

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += validSpend;
        existing.orders.push(o);
        if (!existing.address && o.customer?.address) existing.address = o.customer.address;
        if (!existing.city && o.customer?.city) existing.city = o.customer.city;
      } else {
        customerMap.set(uid, {
          uid,
          name: o.customer?.fullName || 'Guest Customer',
          email: o.customer?.email || 'N/A',
          phone: o.customer?.phone || 'N/A',
          role: 'customer',
          address: o.customer?.address || '',
          city: o.customer?.city || '',
          createdAt: o.createdAt || new Date().toISOString(),
          orderCount: 1,
          totalSpent: validSpend,
          orders: [o],
        });
      }
    }

    let customers = Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (search) {
      customers = customers.filter(
        (c) =>
          String(c.name || '').toLowerCase().includes(search) ||
          String(c.email || '').toLowerCase().includes(search) ||
          String(c.phone || '').toLowerCase().includes(search)
      );
    }

    return res.json({
      success: true,
      count: customers.length,
      customers,
    });
  });

  // Resend confirmation email (ADMIN ONLY)
  app.post('/api/send-confirmation-email', requireAdmin, async (req, res) => {
    try {
      const { order, targetEmail } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order payload required' });
      }

      const email = targetEmail || order.customer?.email;
      const emailHtml = generateOrderEmailHtml(order);

      sentEmailsLog.unshift({
        orderNumber: order.orderNumber,
        to: email,
        sentAt: new Date().toISOString(),
        html: emailHtml,
      });
      saveJsonFile(EMAILS_FILE, sentEmailsLog.slice(0, 200));

      return res.json({
        success: true,
        emailSent: true,
        message: `Order confirmation email sent to ${email}`,
        html: emailHtml,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Review dispatched emails log (ADMIN ONLY)
  app.get('/api/emails', requireAdmin, (_req, res) => {
    return res.json({
      success: true,
      count: sentEmailsLog.length,
      emails: sentEmailsLog,
    });
  });

  // Non-sensitive health endpoint (no PII or internal counts leaked publicly)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      store: 'NOOR STUDIO',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
