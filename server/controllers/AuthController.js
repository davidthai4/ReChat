import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userID) => {
    return jwt.sign({ email, userID }, process.env.JWT_KEY, {
        expiresIn: maxAge,
    });
};

export const signup = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        
        if(!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }
        
        const newUser = await User.create({ email, password });
        
        response.cookie("jwt", createToken(newUser.email, newUser._id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        
        return response.status(201).json({
            user:{
                _id: newUser._id,
                email: newUser.email,
                profileSetup: newUser.profileSetup,
            }
        });
        
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

export const login = async (request, response, next) => {
    try {
        const {email, password} = request.body;
        
        if(!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }
        
        const user = await User.findOne({ email });
        if(!user) {
            return response.status(404).send("User with this email was not found.");
        }
        
        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(401).send("Password is incorrect.");
        }
        
        response.cookie("jwt", createToken(user.email, user._id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        
        return response.status(200).json({
            user:{
                _id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
        
    } catch (error) {
        console.log({ error });
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
    
            _id: userData._id,
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
            _id: userData._id,
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