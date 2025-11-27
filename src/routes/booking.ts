import express from 'express';
import { generateReciept, verifyAndCreateBooking } from '../controllers/booking.controller';
const router = express.Router();

router.post("/create", verifyAndCreateBooking);
router.post("/generate-receipt", generateReciept);

module.exports = router;
