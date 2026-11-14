import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as functionsV1 from 'firebase-functions/v1';

admin.initializeApp();

const AUTHORIZED_ADMIN_EMAIL = 'noorstudio16mpa@gmail.com';
const FIRESTORE_DATABASE_ID = 'ai-studio-noorstudio-209071ad-f5e0-4d8f-89a7-26a16ece27b4';

function getNamedDb() {
  return getFirestore(admin.app(), FIRESTORE_DATABASE_ID);
}

/**
 * Auth onCreate trigger:
 * Assigns Firebase Custom Claims strictly for the verified authorized admin email
 * and ensures every standard sign-up receives role='customer' in Firestore.
 */
export const onUserAccountCreated = functionsV1.auth.user().onCreate(async (user) => {
  const email = (user.email || '').trim().toLowerCase();
  const db = getNamedDb();
  const nowIso = new Date().toISOString();

  if (email === AUTHORIZED_ADMIN_EMAIL && user.emailVerified) {
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin',
    });
    await db.collection('admins').doc(user.uid).set(
      {
        email,
        role: 'admin',
        createdAt: nowIso,
      },
      { merge: true }
    );
    return;
  }

  await admin.auth().setCustomUserClaims(user.uid, {
    admin: false,
    role: 'customer',
  });

  const userRef = db.collection('users').doc(user.uid);
  const existing = await userRef.get();
  if (!existing.exists) {
    await userRef.set({
      uid: user.uid,
      name: user.displayName || 'Customer',
      email,
      phone: user.phoneNumber || '',
      role: 'customer',
      createdAt: nowIso,
    });
  }
});

/**
 * HTTPS Callable function:
 * Verifies caller identity server-side and syncs Firebase Custom Claims
 * ONLY if email === noorstudio16mpa@gmail.com AND email_verified === true.
 */
export const verifyAdminAccess = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;
  const userRecord = await admin.auth().getUser(uid);
  const email = (userRecord.email || '').trim().toLowerCase();

  if (email !== AUTHORIZED_ADMIN_EMAIL || !userRecord.emailVerified) {
    throw new HttpsError('permission-denied', 'Access denied.');
  }

  if (userRecord.customClaims?.admin !== true || userRecord.customClaims?.role !== 'admin') {
    await admin.auth().setCustomUserClaims(uid, {
      ...(userRecord.customClaims || {}),
      admin: true,
      role: 'admin',
    });
  }

  const db = getNamedDb();
  await db.collection('admins').doc(uid).set(
    {
      email,
      role: 'admin',
      verifiedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    authorized: true,
    role: 'admin',
    uid,
  };
});
