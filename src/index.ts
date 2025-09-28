import { Request, Response, Application } from 'express';
import path from "path";
import os from 'os';

require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const formData = require('express-form-data');

const app: Application = express();
const PORT:any = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(formData.parse({ uploadDir: os.tmpdir(), autoClean: true }));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());
app.use("/public", express.static(path.resolve(path.join(__dirname, "../public"))));

// ✅ Routes
const BookingRoutes = require('./routes/booking');

app.use("/booking", BookingRoutes);

// ✅ Health Check Route (optional but useful for monitoring)
app.get('/', (_req: Request, res: Response): void => {
  res.send("Hello Typescript with Node.js! HURRAH!!!");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
