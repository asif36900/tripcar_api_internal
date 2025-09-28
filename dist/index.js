"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const formData = require('express-form-data');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(formData.parse({ uploadDir: os_1.default.tmpdir(), autoClean: true }));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());
app.use("/public", express.static(path_1.default.resolve(path_1.default.join(__dirname, "../public"))));
// ✅ Routes
const BookingRoutes = require('./routes/booking');
app.use("/booking", BookingRoutes);
// ✅ Health Check Route (optional but useful for monitoring)
app.get('/', (_req, res) => {
    res.send("Hello Typescript with Node.js! HURRAH!!!");
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
