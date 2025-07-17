import User from "../models/UserModel.js";  // User model for database operations
import jwt from "jsonwebtoken";          // JWT token creation function
import { compare } from "bcrypt";         // Password hashing comparison function
import { renameSync, unlinkSync } from "fs";         // File system utility to rename files

// Token expiration time: 3 days in milliseconds
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Create JWT token for user authentication
const createToken = (email, userID) => {
    return jwt.sign({ email, userID }, process.env.JWT_KEY, {
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
            return response.status(400).send("Email and Password are required.");
        }
        
        // Create new user in database (password will be auto-hashed by pre-save hook)
        const newUser = await User.create({ email, password });
        
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
        response.status(500).send("Internal server error");
    }
};

export const login = async (request, response, next) => {
    try {
        // Extract email and password from request body
        const {email, password} = request.body;
        
        // Validate required fields
        if(!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        if(!user) {
            return response.status(404).send("User with this email was not found.");
        }
        // Compare provided password with stored hashed password
        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(401).send("Password is incorrect.");
        }
        // Set JWT token as secure cookie
        response.cookie("jwt", createToken(user.email, user.id), {
            maxAge,              // Cookie expires in 3 days
            secure: true,        // Only send over HTTPS
            sameSite: "None",    // Allow cross-site requests
        });
        
        // Send success response with user data - excluding password but now including profile details
        return response.status(200).json({
            user:{
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).send("Internal server error");
    }
};

export const getUserInfo = async (request, response, next) => {
    try {

        const userData = await User.findById(request.userID);
        if (!userData) {
            return response.status(404).send("User with this ID not found.");
        }        
        return response.status(200).json({
    
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
    
        });
        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).send("Internal server error");
    }
}; 

export const updateProfile = async (request, response, next) => {
    try {
        const {userID} = request;
        const { firstName, lastName, color } = request.body;
        if (!firstName || !lastName) {
            return response.status(400).send("First name, last name, and color are required.");
        }   
        
        const userData = await User.findByIdAndUpdate(
            userID,
            { firstName, lastName, color, profileSetup: true },
            { new: true, runValidators: true } // Return the updated document
        );
        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
    
        });
        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).send("Internal server error");
    }
}; 

export const addProfileImage = async (request, response, next) => {
    try {
        if (!request.file) {
            return response.status(400).send("Profile image is required.");
        }
        
        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(request.userID, 
            {image: fileName}, 
            {new: true, runValidators: true}
        );

        return response.status(200).json({
            image: updatedUser.image,

        });
        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).send("Internal server error");
    }
}; 

export const removeProfileImage = async (request, response, next) => {
try {
    const { userID } = request;
    const user = await User.findById(userID);

    if (!user) {
        return response.status(404).send("User not found.");
    }

    if (user.image) {
      try {
        unlinkSync(user.image);
      } catch (err) {
        console.log("Failed to delete image file:", err.message);
        // Optionally: continue anyway, since the DB will be updated
      }
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully.");

        
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response
        response.status(500).send("Internal server error");
    }
}; 

export const logout = async (request, response, next) => {
    try {
        
        response.cookie("jwt", "", {maxAge: 1, secure: true, sameSite: "None"});
    
        return response.status(200).send("Logged out successfully.")
            
        } catch (error) {
            // Log error for debugging
            console.log({ error });
            // Send generic error response
            response.status(500).send("Internal server error");
        }
    };