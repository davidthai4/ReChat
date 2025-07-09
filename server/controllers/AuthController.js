import User from "../models/UserModel.js";
import {sign} from "jsonwebtoken";
const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userID) => {
    return sign({ email, userID }, process.env.JWT_KEY, {expiresIn: maxAge,});
};

export const signup = async (request, response, next) => {
    try {
        const {email,password} = request.body;
        if(!email || !password) {
            return response.status(400).json({ message: "Email and Password are required." });
        }
        const user = await User.create({email, password});
        response.cookie("jwt", createToken(user.email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None",
        });
        return response.status(201).json({
            user:{
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        });
    } catch (error) {
        console.log({ error });
        response.status(500).json({ message: "Internal server error" });
    }
};