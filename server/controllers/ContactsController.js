const Message = require('../models/MessagesModel');
const User = require('../models/UserModel');
const mongoose = require('mongoose');

const searchContacts = async (request, response) => {
    try {
        const { searchTerm } = request.body;
        if (searchTerm === undefined || searchTerm === null || searchTerm === "") {
            return response.status(400).send("Search term is required.");
        }
        const sanitizedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(sanitizedSearchTerm, "i");
        const contacts = await User.find({
            $and: [
                { _id: { $ne: request.userID } },
                { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
            ],
        });
        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const getContactsForDMList = async (request, response) => {
    try {
        let { userID } = request;
        userID = new mongoose.Types.ObjectId(userID);

        const contacts = await Message.aggregate([
            { $match: { $or: [{ sender: userID }, { recipient: userID }] } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userID] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                    lastMessageContent: { $first: "$content" },
                    lastMessageType: { $first: "$messageType" },
                    lastMessageId: { $first: "$_id" },
                    lastMessageSender: { $first: "$sender" },
                },
            },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "contactInfo" } },
            { $unwind: "$contactInfo" },
            { $lookup: { from: "users", localField: "lastMessageSender", foreignField: "_id", as: "senderInfo" } },
            { $unwind: "$senderInfo" },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    lastMessageContent: 1,
                    lastMessageType: 1,
                    lastMessageId: 1,
                    lastMessageSender: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    image: "$contactInfo.image",
                    color: "$contactInfo.color",
                    senderFirstName: "$senderInfo.firstName",
                    senderLastName: "$senderInfo.lastName",
                    senderEmail: "$senderInfo.email",
                },
            },
            { $sort: { lastMessageTime: -1 } },
        ]);

        const contactsWithLastMessage = contacts.map(contact => ({
            ...contact,
            lastMessage: {
                _id: contact.lastMessageId,
                content: contact.lastMessageContent,
                messageType: contact.lastMessageType,
                timestamp: contact.lastMessageTime,
                sender: {
                    _id: contact.lastMessageSender,
                    firstName: contact.senderFirstName,
                    lastName: contact.senderLastName,
                    email: contact.senderEmail,
                }
            }
        }));

        return response.status(200).json({ contacts: contactsWithLastMessage });
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

const getAllContacts = async (request, response) => {
    try {
        const users = await User.find({ _id: { $ne: request.userID } }, "firstName lastName _id email");
        const contacts = users.map(user => ({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
        }));
        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error });
        response.status(500).send("Internal server error");
    }
};

module.exports = { searchContacts, getContactsForDMList, getAllContacts };
