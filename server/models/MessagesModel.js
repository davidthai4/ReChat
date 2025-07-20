import mongoose from "mongoose";

// Message Schema
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function() {
            return !this.channelId; // Required only if not a channel message
        },
    },
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: function() {
            return !this.recipient; // Required only if not a direct message
        },
    },
    messageType: {
        type: String,
        enum: ["text", "file"],
        required: true,
    },
    content: {
        type: String,
        required: function() {
            return this.messageType === "text";
        },
    },
    fileUrl: {
        type: String,
        required: function() {
            return this.messageType === "file";
        },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        readAt: {
            type: Date,
            default: Date.now,
        },
    }],
});

const Message = mongoose.model("Messages", messageSchema);

export default Message;