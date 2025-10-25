const { getAuth } = require('./firebaseAdmin');

/**
 * Express middleware that verifies Firebase session cookie and attaches decoded claims to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return res.status(401).json({ error: 'Unauthorized' });

    // Verify session cookie; checkRevoked true enforces logout after revocation
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims; // includes uid, email, etc.
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };
