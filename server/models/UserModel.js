import mongoose from "mongoose";
import {genSalt, hash} from "bcrypt";  // Password hashing functions

// Define user schema - structure of user data in database
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],  // Must provide email with custom error message
        unique: true,                           // No duplicate emails allowed
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    firstName: {
        type: String,
        required: false,                        // Optional field
    },
    lastName: {
        type: String,
        required: false,
    },
    image: {
        type: String,                          // URL or path to profile image
        required: false,
    },
    color: {
        type: Number,                          // Profile color theme (likely numeric color code)
        required: false,
    },
    profileSetup: {
        type: Boolean,
        default: false,                        // Tracks if user completed profile setup
    },
});

// Pre-save middleware - runs before saving user to database
userSchema.pre("save", async function (next) {
    const salt = await genSalt();                    // Generate salt for password hashing
    this.password = await hash(this.password, salt); // Hash password with salt
    next();                                          // Continue with save operation
});

// Create User model from schema
const User = mongoose.model("User", userSchema);

export default User;