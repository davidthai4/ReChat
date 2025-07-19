import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";

export const createChannel = async (request, response, next) => {
    try {
        const { name, members } = request.body;
        const userID = request.userID;

        const admin = await User.findById(userID);

        if (!admin) {
            return response.status(400).send("Admin not found.");
        };
        const validMembers = await User.find({ _id: { $in: members } });

        if (validMembers.length !== members.length) {
            return response.status(400).send("Member(s) not valid user(s).");
        };

        const newChannel = await Channel({
            name,
            members,
            admin: userID,
        });

        await newChannel.save();

        return response.status(201).json({ channel: newChannel });


    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};

export const getUserChannels = async (request, response, next) => {
    try {
        const userID = new mongoose.Types.ObjectId(request.userID);
        const channels = await Channel.find({ 
            $or: [{ admin: userID }, { members:  userID }],
        }).sort({ updatedAt: -1 });



        return response.status(201).json({ channels });


    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};