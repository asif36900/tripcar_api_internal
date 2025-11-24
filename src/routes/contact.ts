import express from 'express';
import { createContactUs } from '../controllers/contact.controller';
const router = express.Router();

router.post("/create", createContactUs);
// router.get("/all", fetchRoles);

module.exports = router;
