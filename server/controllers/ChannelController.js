import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";
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

        // Get last message for each channel
        const channelsWithLastMessage = await Promise.all(
            channels.map(async (channel) => {
                const lastMessage = await Message.findOne({ channelId: channel._id })
                    .sort({ timestamp: -1 })
                    .populate("sender", "firstName lastName email image color");
                
                return {
                    ...channel.toObject(),
                    lastMessage: lastMessage ? {
                        _id: lastMessage._id,
                        content: lastMessage.content,
                        messageType: lastMessage.messageType,
                        timestamp: lastMessage.timestamp,
                        sender: {
                            _id: lastMessage.sender._id,
                            firstName: lastMessage.sender.firstName,
                            lastName: lastMessage.sender.lastName,
                            email: lastMessage.sender.email,
                        }
                    } : null,
                };
            })
        );

        // Sort by last message timestamp or channel creation date
        channelsWithLastMessage.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.createdAt;
            const bTime = b.lastMessage?.timestamp || b.createdAt;
            return new Date(bTime) - new Date(aTime);
        });

        return response.status(201).json({ channels: channelsWithLastMessage });


    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};