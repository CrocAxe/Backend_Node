const { admin } = require("../config/firebase");

const verifyAuth = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const idToken = token.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = verifyAuth;