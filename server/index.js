import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8888;
const databaseURL = process.env.DATABASE_URL;


const server = app.listen(port, () => {
    console.log(`Server is running at http:localhost:${port}`);
});