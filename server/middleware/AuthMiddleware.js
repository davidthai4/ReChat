import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    console.log(req.cookies)
    const token = req.cookies.jwt; // Get JWT from cookies
    if (!token) {
        return res.status(401).send("Unauthorized"); // No token provided
    } 
    jwt.verify(token, process.env.JWT_KEY, async(err,payload) => {
        if (err) {
            return res.status(401).send("Token is not valid"); // Invalid token
        }
        // Attach user ID to request object for further processing
        req.userID = payload.userID;
        next(); // Proceed to the next middleware or route handler
    });  
};