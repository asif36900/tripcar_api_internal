import { Request, Response } from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Booking from "../database/models/Booking";
import Payment from "../database/models/Payment";
import sequelize from "../database/connection";
import { sendBookingConfirmationEmail } from "../lib/sendEmail";

// export const verifyAndCreateBooking = async (req: Request, res: Response) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       ...bookingData
//     } = req.body;

//     console.log("Frontend booking payload:", bookingData);

//     // ⚠️ If you are in TESTING without Razorpay signature, keep this commented

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
//       .update(sign)
//       .digest("hex");

//     if (razorpay_signature !== expectedSign) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid signature. Possible fake payment.",
//       });
//     }


//     // ✅ Transaction: Save Booking + Payment
//     const transaction = await sequelize.transaction();

//     try {
//       // 🔹 Generate unique IDs
//       const bookingCode = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       const transactionId = `TXN-${uuidv4()}`;

//       // 1️⃣ Save booking
//       const booking = await Booking.create(
//         {
//           bookingCode,

//           // mapping frontend → model fields
//           fullName: bookingData.name,
//           email: bookingData.email,
//           phone: bookingData.contact,

//           bookingType: bookingData.bookingType,
//           pickupLocation: bookingData.pickupLocation,
//           destination: bookingData.destination,
//           tripType: bookingData.tripType,
//           pickupDate: bookingData.pickupDate,
//           pickupTime: bookingData.pickupTime,
//           returnDate: bookingData.returnDate || null,
//           returnTime: bookingData.returnTime || null,
//           rentalPackage: bookingData.rentalPackage || null,
//           passengers: bookingData.passengers,

//           vehicleId: bookingData.id,
//           vehicleName: bookingData.vehicleName,
//           vehicleType: bookingData.type,
//           ac: bookingData.ac,
//           seats: bookingData.seats,
//           image: bookingData.image,
//           baseRate: bookingData.baseRate,
//           extraKmRate: bookingData.extraKmRate,
//           features: bookingData.features,

//           amount: bookingData.amount,
//           currency: bookingData.currency || "INR",
//           paymentStatus: "completed",
//         },
//         { transaction }
//       );

//       // 2️⃣ Save payment
//       await Payment.create(
//         {
//           transactionId,
//           bookingId: booking.id,
//           razorpay_order_id: razorpay_order_id || "TEST_ORDER",
//           razorpay_payment_id: razorpay_payment_id || "TEST_PAYMENT",
//           razorpay_signature: razorpay_signature || "TEST_SIGNATURE",
//           amount: bookingData.amount,
//           currency: bookingData.currency || "INR",
//           status: "success",
//         },
//         { transaction }
//       );

//       await transaction.commit();

//       return res.status(200).json({
//         success: true,
//         message: "Payment verified & booking saved successfully",
//         data: { booking, transactionId, bookingCode },
//       });
//     } catch (error) {
//       await transaction.rollback();
//       console.error("Booking save failed:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to save booking/payment",
//       });
//     }
//   } catch (err) {
//     console.error("Error verifying Razorpay payment:", err);
//     return res.status(500).json({ success: false, message: "Server error verifying payment" });
//   }
// };


// Booking Api Controller
// ... imports ...

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
      await sendBookingConfirmationEmail(bookingWithDetails);
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
