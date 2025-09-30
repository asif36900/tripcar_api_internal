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

    // ⚠️ If you are in TESTING without Razorpay signature, keep this commented
    
    // NOTE: This check should potentially be conditional based on paymentMethod
    // If paymentMethod is NOT 'razorpay' (e.g., 'cash'), these might be missing and that's okay.
    // However, for the scope of this file, we assume a Razorpay flow is expected if these are present.
    if (bookingData.paymentMethod === 'razorpay' && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
       return res.status(400).json({ success: false, message: "Missing required Razorpay fields for online payment" });
    }

    // --- Razorpay Signature Verification Block (Keep as is) ---
    if (bookingData.paymentMethod === 'razorpay' && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
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
    // ---------------------------------------------------------
 
    // ✅ Transaction: Save Booking + Payment
    const transaction = await sequelize.transaction();

    try {
      // 🔹 Generate unique IDs
      const bookingCode = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const transactionId = `TXN-${uuidv4()}`;
      
      // Determine payment status based on amount paid (assuming amountPaid > 0 means 'completed' for now)
      // A more robust system might use finalTotalFare === amountPaid for 'completed'
      const paymentStatus = (bookingData.amountPaid > 0) ? "completed" : "pending";
      
      // 1️⃣ Save booking
      const booking = await Booking.create(
        {
          bookingCode,

          // mapping frontend → model fields
          // Common Booking Details (Step 1 & 2)
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

          // Vehicle Details (Step 3)
          vehicleId: bookingData.id,
          vehicleName: bookingData.vehicleName,
          vehicleType: bookingData.type,
          ac: bookingData.ac,
          seats: bookingData.seats,
          image: bookingData.image,
          baseRate: bookingData.baseRate,
          extraKmRate: bookingData.extraKmRate,
          features: bookingData.features,

          // 🆕 Fare & Payment Details 
          finalTotalFare: bookingData.finalTotalFare, // 🆕 Mapped
          discountApplied: bookingData.discountApplied, // 🆕 Mapped
          distance: bookingData.distance, // 🆕 Mapped
          paymentMethod: bookingData.paymentMethod, // 🆕 Mapped
          paymentPercentage: bookingData.paymentPercentage, // 🆕 Mapped
          amountPaid: bookingData.amountPaid, // 🆕 Mapped (Renamed model field 'amount' to 'amountPaid')
          remainingAmount: bookingData.remainingAmount, // 🆕 Mapped

          // Old field 'amount' is now 'amountPaid', so we map it correctly
          // We will use amountPaid for the booking amount column
          amount: bookingData.amountPaid, // This is the old 'amount' field in model
          currency: bookingData.currency || "INR", // Assuming currency comes from frontend or default
          paymentStatus: paymentStatus, // Use the determined status
        },
        { transaction }
      );

      // 2️⃣ Save payment (Only if amountPaid is greater than 0)
      if (bookingData.amountPaid > 0) {
          await Payment.create(
            {
              transactionId,
              bookingId: booking.id,
              // Use actual IDs if razorpay, otherwise use a placeholder
              razorpay_order_id: razorpay_order_id || (bookingData.paymentMethod !== 'razorpay' ? "OFFLINE_ORDER" : ""),
              razorpay_payment_id: razorpay_payment_id || (bookingData.paymentMethod !== 'razorpay' ? "OFFLINE_PAYMENT" : ""),
              razorpay_signature: razorpay_signature || (bookingData.paymentMethod !== 'razorpay' ? "OFFLINE_SIGNATURE" : ""),
              amount: bookingData.amountPaid, // Use amountPaid
              currency: bookingData.currency || "INR",
              status: "success", // Since we only save payment on success/completion
            },
            { transaction }
          );
      }


      await transaction.commit();

      
      // 3️⃣ 🆕 Send Confirmation Email AFTER successful commit
      // We use await to ensure email is attempted, but wrap it in a try/catch
      // or rely on the function's internal logging so it doesn't block the response.
      try {
        await sendBookingConfirmationEmail(booking);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Do not return an error to the user, as the booking is already saved.
      }

      return res.status(200).json({
        success: true,
        message: "Booking saved successfully" + (paymentStatus === 'completed' ? " & Payment verified" : ""),
        data: { booking, transactionId, bookingCode },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Booking save failed:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save booking/payment",
      });
    }
  } catch (err) {
    console.error("Error processing booking:", err);
    return res.status(500).json({ success: false, message: "Server error processing booking" });
  }
};