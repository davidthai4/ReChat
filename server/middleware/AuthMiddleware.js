const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send("Unauthorized");
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = payload.userID;
        next();
    } catch (err) {
        return res.status(401).send("Token is not valid");
    }
};

module.exports = { verifyToken };
