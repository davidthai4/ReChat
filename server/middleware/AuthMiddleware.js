import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    console.log("=== AUTH MIDDLEWARE START ===");
    console.log("Cookies:", req.cookies);
    console.log("JWT Key exists:", !!process.env.JWT_KEY);
    
    const token = req.cookies.jwt;
    if (!token) {
        console.log("No JWT token found");
        return res.status(401).send("Unauthorized");
    } 
    
    try {
        const payload = jwt.verify(token, process.env.JWT_KEY);
        console.log("JWT payload:", payload);
        req.userID = payload.userID;
        console.log("User authenticated:", req.userID);
        console.log("=== AUTH MIDDLEWARE END ===");
        next();
    } catch (err) {
        console.log("JWT verification failed:", err);
        return res.status(401).send("Token is not valid");
    }
};