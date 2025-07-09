import User from "../models/UserModel.js";  // User model for database operations
import {sign} from "jsonwebtoken";          // JWT token creation function

// Token expiration time: 3 days in milliseconds
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Create JWT token for user authentication
const createToken = (email, userID) => {
    return sign({ email, userID }, process.env.JWT_KEY, {
        expiresIn: maxAge,
    });
};

// User signup route handler
export const signup = async (request, response, next) => {
    try {
        // Extract email and password from request body
        const {email, password} = request.body;
        
        // Validate required fields
        if(!email || !password) {
            return response.status(400).json({ message: "Email and Password are required." });
        }
        
        // Create new user in database (password will be auto-hashed by pre-save hook)
        const newUser = await User.create({email, password});
        
        // Set JWT token as secure cookie
        response.cookie("jwt", createToken(newUser.email, newUser.id), {
            maxAge,              // Cookie expires in 3 days
            secure: true,        // Only send over HTTPS
            sameSite: "None",    // Allow cross-site requests
        });
        
        // Send success response with user data (excluding password)
        return response.status(201).json({
            user:{
                id: newUser.id,
                email: newUser.email,
                profileSetup: newUser.profileSetup,
            }
        });
        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).json({ message: "Internal server error" });
    }
};