import { Request, Response } from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Booking from "../database/models/Booking";
import Payment from "../database/models/Payment";
import sequelize from "../database/connection";
import chromium from "chrome-aws-lambda";
import { sendBookingConfirmationEmail } from "../lib/sendEmail";

export const verifyAndCreateBooking = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ...bookingData
    } = req.body;

    console.log("Frontend booking payload:", bookingData);

    if (
      bookingData.paymentMethod === "razorpay" &&
      (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required Razorpay fields for online payment" });
    }

    if (
      bookingData.paymentMethod === "razorpay" &&
      razorpay_order_id &&
      razorpay_payment_id &&
      razorpay_signature
    ) {
      const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
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
    let booking: any;
    let transactionId: string;
    const transaction = await sequelize.transaction();

    try {
      const bookingCode = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      transactionId = `TXN-${uuidv4()}`;

      const paymentStatus = bookingData.amountPaid > 0 ? "completed" : "pending";

      booking = await Booking.create(
        {
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
        },
        { transaction }
      );

        await Payment.create(
          {
            transactionId,
            bookingId: booking.id,
            razorpay_order_id:
              razorpay_order_id || (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_ORDER" : ""),
            razorpay_payment_id:
              razorpay_payment_id ||
              (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_PAYMENT" : ""),
            razorpay_signature:
              razorpay_signature ||
              (bookingData.paymentMethod !== "razorpay" ? "OFFLINE_SIGNATURE" : ""),
            amount: bookingData.amountPaid,
            currency: bookingData.currency || "INR",
            status: "success",
          },
          { transaction }
        );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Booking save failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save booking/payment",
      });
    }

    // 🔹 Only AFTER commit: fetch full booking + send email
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [{ model: Payment, as: "payments" }],
    });

    try {
      await sendBookingConfirmationEmail(bookingWithDetails, bookingData.email);
      await sendBookingConfirmationEmail(bookingWithDetails, 'Infoeasygocab@gmail.com');
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message:
        "Booking saved successfully" +
        (booking.paymentStatus === "completed" ? " & Payment verified" : ""),
      data: bookingWithDetails,
    });
  } catch (err) {
    console.error("Error processing booking:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error processing booking" });
  }
};


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


export const generateReciept = async (req: Request, res: Response) => {
  try {
    const { receiptData } = req.body;

    if (!receiptData) {
      return res.status(400).json({ success: false, message: "Missing receipt data" });
    }

    const generateHTML = (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { width: 400px; margin: auto; border: 1px solid #333; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td, th { border: 1px solid #333; padding: 8px; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h2>Booking Receipt</h2>
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Mobile:</strong> ${data.mobile}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Service:</strong> ${data.serviceType}</p>
          <p><strong>Car:</strong> ${data.car}</p>
          <p><strong>Pickup:</strong> ${data.pickup}</p>
          <p><strong>Destination:</strong> ${data.destination}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>

          <table>
            <tr><td>Total Fare</td><td>${data.totalFare}</td></tr>
            <tr><td>Paid Amount</td><td>${data.paidAmount}</td></tr>
            <tr class="total"><td>Remaining</td><td>${data.remainingAmount}</td></tr>
            <tr><td>Transaction ID</td><td>${data.transactionId}</td></tr>
          </table>
        </div>
      </body>
      </html>
    `;

    // Launch Chromium from chrome-aws-lambda
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(generateHTML(receiptData), {
      waitUntil: "networkidle0",
    });

    const imageBuffer = await page.screenshot({ fullPage: true });
    await browser.close();

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": "attachment; filename=receipt.png",
    });

    return res.send(imageBuffer);
  } catch (error) {
    console.error("Receipt Error =>", error);
    return res.status(500).json({ success: false, message: "Failed to generate receipt" });
  }
};
