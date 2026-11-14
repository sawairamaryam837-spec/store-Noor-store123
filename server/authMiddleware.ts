import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { applicationDefault, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AUTHORIZED_ADMIN_EMAIL = 'noorstudio16mpa@gmail.com';
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Read Firebase project ID and DB ID from firebase-applet-config.json
function loadFirebaseProjectConfig(): { projectId: string; firestoreDatabaseId?: string } {
  try {
    const configPath = path.resolve(__dirname, '..', 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0278972764' };
  }
}

export const firebaseProjectConfig = loadFirebaseProjectConfig();

// Optional Firebase Admin SDK initialization (when service account or ADC is configured)
let adminSdkReady = false;
try {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseProjectConfig.projectId,
      });
      adminSdkReady = true;
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: applicationDefault(),
        projectId: firebaseProjectConfig.projectId,
      });
      adminSdkReady = true;
    }
  } else {
    getApp();
    adminSdkReady = true;
  }
} catch (err) {
  console.warn('[AUTH] Firebase Admin SDK optional init skipped:', (err as Error).message);
}

export function isAdminSdkInitialized(): boolean {
  return adminSdkReady;
}

export interface VerifiedAuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  role: 'admin' | 'customer';
  customClaims: Record<string, any>;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: VerifiedAuthUser | null;
    }
  }
}

interface CertCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: CertCache | null = null;

async function fetchGoogleSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expiresAt > now) {
    return certCache.certs;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${response.status})`);
  }

  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 3600 * 1000;

  certCache = {
    certs,
    expiresAt: now + Math.max(60_000, maxAgeMs),
  };
  return certs;
}

function decodeBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64');
}

export type CertProvider = () => Promise<Record<string, string>>;

/**
 * Cryptographically verifies a Firebase ID Token (RS256) against Google's official X.509 certificates
 * (or Firebase Admin SDK when credentials are present).
 */
export async function verifyFirebaseIdToken(
  token: string,
  customCertProvider?: CertProvider
): Promise<VerifiedAuthUser> {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing authentication token.');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed authentication token.');
  }

  // If Firebase Admin SDK is initialized and no custom test provider was injected, use Admin SDK
  if (adminSdkReady && !customCertProvider) {
    const decoded = await getAuth().verifyIdToken(token, true);
    const email = (decoded.email || '').trim().toLowerCase();
    const emailVerified = decoded.email_verified === true;
    const isAdmin =
      email === AUTHORIZED_ADMIN_EMAIL && (emailVerified || decoded.admin === true);

    return {
      uid: decoded.uid,
      email,
      emailVerified,
      isAdmin,
      role: isAdmin ? 'admin' : 'customer',
      customClaims: decoded,
    };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  let header: any;
  let payload: any;

  try {
    header = JSON.parse(decodeBase64Url(headerB64).toString('utf-8'));
    payload = JSON.parse(decodeBase64Url(payloadB64).toString('utf-8'));
  } catch {
    throw new Error('Invalid token encoding.');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported token algorithm or missing key identifier.');
  }

  const certs = customCertProvider
    ? await customCertProvider()
    : await fetchGoogleSecureTokenCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    // Force refresh certs once in case Google rotated keys
    if (!customCertProvider) {
      certCache = null;
      const refreshedCerts = await fetchGoogleSecureTokenCerts();
      if (!refreshedCerts[header.kid]) {
        throw new Error('Token signing key is unrecognized.');
      }
      return verifyWithCert(headerB64, payloadB64, signatureB64, payload, refreshedCerts[header.kid]);
    }
    throw new Error('Token signing key is unrecognized.');
  }

  return verifyWithCert(headerB64, payloadB64, signatureB64, payload, certPem);
}

function verifyWithCert(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  payload: any,
  certPem: string
): VerifiedAuthUser {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const signature = decodeBase64Url(signatureB64);
  const isSignatureValid = verifier.verify(certPem, signature);
  if (!isSignatureValid) {
    throw new Error('Invalid authentication token signature.');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const projectId = firebaseProjectConfig.projectId;
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  if (payload.aud !== projectId) {
    throw new Error('Token audience mismatch.');
  }
  if (payload.iss !== expectedIssuer) {
    throw new Error('Token issuer mismatch.');
  }
  if (typeof payload.sub !== 'string' || !payload.sub.trim() || payload.sub.length > 128) {
    throw new Error('Token subject is invalid.');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Authentication session has expired.');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new Error('Token issued-at timestamp is invalid.');
  }
  if (typeof payload.auth_time !== 'number' || payload.auth_time > nowSec + 300) {
    throw new Error('Token auth_time is invalid.');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const emailVerified = payload.email_verified === true;
  const isAdmin =
    email === AUTHORIZED_ADMIN_EMAIL && (emailVerified || payload.admin === true);

  return {
    uid: payload.sub,
    email,
    emailVerified,
    isAdmin,
    role: isAdmin ? 'admin' : 'customer',
    customClaims: payload,
  };
}

export async function syncAdminCustomClaimIfPossible(uid: string, email: string): Promise<boolean> {
  if (!adminSdkReady || email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
    return false;
  }
  try {
    const adminAuth = getAuth();
    const userRecord = await adminAuth.getUser(uid);
    if ((userRecord.email || '').toLowerCase() !== AUTHORIZED_ADMIN_EMAIL || !userRecord.emailVerified) {
      return false;
    }
    if (userRecord.customClaims?.admin !== true || userRecord.customClaims?.role !== 'admin') {
      await adminAuth.setCustomUserClaims(uid, {
        ...(userRecord.customClaims || {}),
        admin: true,
        role: 'admin',
      });
    }
    return true;
  } catch (err) {
    console.warn('[AUTH] Failed syncing custom claims:', (err as Error).message);
    return false;
  }
}

export type TokenVerifierFn = (token: string) => Promise<VerifiedAuthUser>;

export function createAuthMiddlewares(customVerifier?: TokenVerifierFn) {
  const verifyToken: TokenVerifierFn = customVerifier
    ? customVerifier
    : (token) => verifyFirebaseIdToken(token);

  const extractBearerToken = (req: express.Request): string | null => {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') return null;
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
  };

  const requireAuth = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Please sign in.',
        });
      }
      const verifiedUser = await verifyToken(token);
      req.authUser = verifiedUser;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: (err as Error).message || 'Invalid or expired authentication session.',
      });
    }
  };

  const requireAdmin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Administrator authentication required.',
        });
      }
      const verifiedUser = await verifyToken(token);
      req.authUser = verifiedUser;

      const isAuthorizedEmail =
        verifiedUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
      const isVerifiedClaimOrEmail =
        verifiedUser.emailVerified === true || verifiedUser.customClaims?.admin === true;

      if (!isAuthorizedEmail || !isVerifiedClaimOrEmail || !verifiedUser.isAdmin) {
        // Never leak the authorized admin email in unauthorized responses
        return res.status(403).json({
          success: false,
          error: 'Access denied. Unauthorized account.',
        });
      }

      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: (err as Error).message || 'Invalid or expired administrator session.',
      });
    }
  };

  const optionalAuth = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const header = req.headers.authorization;
    if (!header) {
      req.authUser = null;
      return next();
    }
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Malformed authorization header.',
      });
    }
    try {
      req.authUser = await verifyToken(token);
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: (err as Error).message || 'Invalid authentication token.',
      });
    }
  };

  return { requireAuth, requireAdmin, optionalAuth };
}
