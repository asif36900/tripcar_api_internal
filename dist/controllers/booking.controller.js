"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReciept = exports.verifyAndCreateBooking = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const Booking_1 = __importDefault(require("../database/models/Booking"));
const Payment_1 = __importDefault(require("../database/models/Payment"));
const connection_1 = __importDefault(require("../database/connection"));
const sendEmail_1 = require("../lib/sendEmail");
const verifyAndCreateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { razorpay_order_id, razorpay_payment_id, razorpay_signature } = _a, bookingData = __rest(_a, ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"]);
        console.log("Frontend booking payload:", bookingData);
        if (bookingData.paymentMethod === "razorpay" &&
            (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required Razorpay fields for online payment" });
        }
        if (bookingData.paymentMethod === "razorpay" &&
            razorpay_order_id &&
            razorpay_payment_id &&
            razorpay_signature) {
            const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSign = crypto_1.default
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign)
                .digest("hex");
            if (razorpay_signature !== expectedSign) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid signature. Possible fake payment.",
                });
            }
        }
        // ✅ Transaction: Save Booking + Payment
        let booking;
        let transactionId;
        const transaction = yield connection_1.default.transaction();
        try {
            const bookingCode = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            transactionId = `TXN-${(0, uuid_1.v4)()}`;
            const paymentStatus = bookingData.amountPaid > 0 ? "completed" : "pending";
            booking = yield Booking_1.default.create({
                bookingCode,
                fullName: bookingData.name,
                email: bookingData.email,
                phone: bookingData.contact,
                bookingType: bookingData.bookingType,
                pickupLocation: bookingData.pickupLocation,
                destination: bookingData.destination,
                tripType: bookingData.tripType,
                pickupDate: bookingData.pickupDate,
                pickupTime: bookingData.pickupTime,
                returnDate: bookingData.returnDate || null,
                returnTime: bookingData.returnTime || null,
                rentalPackage: bookingData.rentalPackage || null,
                passengers: bookingData.passengers,
                vehicleId: bookingData.id,
                vehicleName: bookingData.vehicleName,
                vehicleType: bookingData.type,
                ac: bookingData.ac,
                seats: bookingData.seats,
                image: bookingData.image,
                baseRate: bookingData.baseRate,
                extraKmRate: bookingData.extraKmRate,
                features: bookingData.features,
                finalTotalFare: bookingData.finalTotalFare,
                discountApplied: bookingData.discountApplied,
                distance: bookingData.distance,
                paymentMethod: bookingData.paymentMethod,
                paymentPercentage: bookingData.paymentPercentage,
                amountPaid: bookingData.amountPaid,
                remainingAmount: bookingData.remainingAmount,
                amount: bookingData.amountPaid,
                currency: bookingData.currency || "INR",
                paymentStatus,
            }, { transaction });
            yield Payment_1.default.create({
                transactionId,
                bookingId: booking.id,
                razorpay_order_id: razorpay_order_id || (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_ORDER" : ""),
                razorpay_payment_id: razorpay_payment_id ||
                    (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_PAYMENT" : ""),
                razorpay_signature: razorpay_signature ||
                    (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_SIGNATURE" : ""),
                amount: bookingData.amountPaid,
                currency: bookingData.currency || "INR",
                status: "success",
            }, { transaction });
            yield transaction.commit();
        }
        catch (error) {
            yield transaction.rollback();
            console.error("Booking save failed:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to save booking/payment",
            });
        }
        // 🔹 Only AFTER commit: fetch full booking + send email
        const bookingWithDetails = yield Booking_1.default.findByPk(booking.id, {
            include: [{ model: Payment_1.default, as: "payments" }],
        });
        try {
            yield (0, sendEmail_1.sendBookingConfirmationEmail)(bookingWithDetails, bookingData.email);
            yield (0, sendEmail_1.sendBookingConfirmationEmail)(bookingWithDetails, 'Infoeasygocab@gmail.com');
        }
        catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
        }
        return res.status(200).json({
            success: true,
            message: "Booking saved successfully" +
                (booking.paymentStatus === "completed" ? " & Payment verified" : ""),
            data: bookingWithDetails,
        });
    }
    catch (err) {
        console.error("Error processing booking:", err);
        return res
            .status(500)
            .json({ success: false, message: "Server error processing booking" });
    }
});
exports.verifyAndCreateBooking = verifyAndCreateBooking;
// export const generateReciept = async (req: Request, res: Response) => {
//   try {
//     const { receiptData } = req.body;
//     if (!receiptData) {
//       return res.status(400).json({ success: false, message: "Missing receipt data" });
//     }
//     // HTML TEMPLATE
//     const generateHTML = (data:any) => `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Receipt</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           .receipt { width: 400px; margin: auto; border: 1px solid #333; padding: 20px; }
//           h2 { text-align: center; }
//           table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//           td, th { border: 1px solid #333; padding: 8px; text-align: left; }
//           .total { font-weight: bold; }
//           .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #555; }
//         </style>
//       </head>
//       <body>
//         <div class="receipt">
//           <h2>Booking Receipt</h2>
//           <p><strong>Booking ID:</strong> ${data.bookingId}</p>
//           <p><strong>Customer:</strong> ${data.customerName}</p>
//           <p><strong>Mobile:</strong> ${data.mobile}</p>
//           <p><strong>Email:</strong> ${data.email}</p>
//           <p><strong>Service:</strong> ${data.serviceType}</p>
//           <p><strong>Car:</strong> ${data.car}</p>
//           <p><strong>Pickup:</strong> ${data.pickup}</p>
//           <p><strong>Destination:</strong> ${data.destination}</p>
//           <p><strong>Date:</strong> ${data.date}</p>
//           <p><strong>Time:</strong> ${data.time}</p>
//           <table>
//             <tr><td>Total Fare</td><td>${data.totalFare}</td></tr>
//             <tr><td>Paid Amount</td><td>${data.paidAmount}</td></tr>
//             <tr class="total"><td>Remaining Amount</td><td>${data.remainingAmount}</td></tr>
//             <tr><td>Transaction ID</td><td>${data.transactionId}</td></tr>
//           </table>
//           <div class="footer">Thank you for choosing our service!</div>
//         </div>
//       </body>
//       </html>
//     `;
//     // LAUNCH PUPPETEER
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       executablePath: puppeteer.executablePath() // IMPORTANT
//     });
//     const page = await browser.newPage();
//     await page.setContent(generateHTML(receiptData), { waitUntil: "networkidle0" });
//     const imageBuffer = await page.screenshot({ fullPage: true });
//     await browser.close();
//     // SEND IMAGE BACK
//     res.set({
//       "Content-Type": "image/png",
//       "Content-Disposition": "attachment; filename=receipt.png"
//     });
//     res.send(imageBuffer);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate receipt",
//     });
//   }
// }
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateReciept = (req, res) => {
    const { receiptData } = req.body;
    if (!receiptData)
        return res.status(400).json({ message: "Missing data" });
    const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${receiptData.bookingId}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text("Booking Receipt", { align: "center" }).moveDown();
    doc.fontSize(12).text(`Booking ID: ${receiptData.bookingId}`);
    doc.text(`Customer: ${receiptData.customerName}`);
    doc.text(`Mobile: ${receiptData.mobile}`);
    doc.text(`Email: ${receiptData.email}`);
    doc.text(`Service: ${receiptData.serviceType}`);
    doc.text(`Car: ${receiptData.car}`);
    doc.text(`Pickup: ${receiptData.pickup}`);
    doc.text(`Destination: ${receiptData.destination}`);
    doc.text(`Date: ${receiptData.date}`);
    doc.text(`Time: ${receiptData.time}`);
    doc.moveDown();
    doc.text(`Total Fare: ${receiptData.totalFare}`);
    doc.text(`Paid Amount: ${receiptData.paidAmount}`);
    doc.text(`Remaining Amount: ${receiptData.remainingAmount}`);
    doc.text(`Transaction ID: ${receiptData.transactionId}`);
    doc.moveDown();
    doc.text("Thank you for choosing our service!", { align: "center" });
    doc.end();
};
exports.generateReciept = generateReciept;
