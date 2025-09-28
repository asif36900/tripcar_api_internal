import express from 'express';
import { verifyAndCreateBooking } from '../controllers/booking.controller';
const router = express.Router();

router.post("/create", verifyAndCreateBooking);
// router.get("/all", fetchRoles);

module.exports = router;
