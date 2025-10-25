const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin SDK once per process
function initFirebaseAdmin() {
  if (getApps().length) return; // already initialized

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    GOOGLE_APPLICATION_CREDENTIALS,
  } = process.env;

  try {
    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
      // Private key may have literal \n; convert to newlines
      const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      // eslint-disable-next-line no-console
      console.log('[firebase-admin] initialized from env vars');
    } else {
      // Fallback to ADC (GOOGLE_APPLICATION_CREDENTIALS or metadata)
      initializeApp({ credential: applicationDefault() });
      // eslint-disable-next-line no-console
      console.log(
        GOOGLE_APPLICATION_CREDENTIALS
          ? `[firebase-admin] initialized via ADC at ${GOOGLE_APPLICATION_CREDENTIALS}`
          : '[firebase-admin] initialized via ADC'
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[firebase-admin] initialization error:', err.message);
    throw err;
  }
}

initFirebaseAdmin();

module.exports = { getAuth };
