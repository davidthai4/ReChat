const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { compare } = require('bcrypt');
const { renameSync, unlinkSync } = require('fs');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userID) => {
    return jwt.sign({ email, userID }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
};

const signup = async (request, response) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }
        const newUser = await User.create({ email, password });
        response.cookie("jwt", createToken(newUser.email, newUser._id), {
            maxAge,
            secure: false,
            sameSite: "Lax",
        });
        return response.status(201).json({
            user: {
                _id: newUser._id,
                email: newUser.email,
                profileSetup: newUser.profileSetup,
            }
        });
    } catch (error) {
        console.log({ error });
        if (error.code === 11000) {
            return response.status(409).send("An account with this email already exists.");
        }
        response.status(500).send("Internal server error");
    }
};

const login = async (request, response) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).send("User with this email was not found.");
        }
        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(401).send("Password is incorrect.");
        }
        response.cookie("jwt", createToken(user.email, user._id), {
            maxAge,
            secure: false,
            sameSite: "Lax",
        });
        return response.status(200).json({
            user: {
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

const getUserInfo = async (request, response) => {
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
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const updateProfile = async (request, response) => {
    try {
        const { userID } = request;
        const { firstName, lastName, color } = request.body;
        if (!firstName || !lastName) {
            return response.status(400).send("First name and last name are required.");
        }
        const userData = await User.findByIdAndUpdate(
            userID,
            { firstName, lastName, color, profileSetup: true },
            { new: true, runValidators: true }
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
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const addProfileImage = async (request, response) => {
    try {
        if (!request.file) {
            return response.status(400).send("Profile image is required.");
        }
        const date = Date.now();
        let fileName = "uploads/profiles/" + date + request.file.originalname;
        renameSync(request.file.path, fileName);
        const updatedUser = await User.findByIdAndUpdate(
            request.userID,
            { image: fileName },
            { new: true, runValidators: true }
        );
        return response.status(200).json({ image: updatedUser.image });
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const removeProfileImage = async (request, response) => {
    try {
        const { userID } = request;
        const user = await User.findById(userID);
        if (!user) {
            return response.status(404).send("User not found.");
        }
        if (user.image) {
            try { unlinkSync(user.image); } catch (err) { /* ignore missing file */ }
        }
        user.image = null;
        await user.save();
        return response.status(200).send("Profile image removed successfully.");
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const logout = async (request, response) => {
    try {
        response.cookie("jwt", "", { maxAge: 1, secure: false, sameSite: "Lax" });
        return response.status(200).send("Logged out successfully.");
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

module.exports = { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logout };
