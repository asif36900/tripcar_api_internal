"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const router = express_1.default.Router();
router.post("/create", booking_controller_1.verifyAndCreateBooking);
router.post("/generate-receipt", booking_controller_1.generateReciept);
module.exports = router;
