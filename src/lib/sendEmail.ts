// controllers/mailer.controller.ts

import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';
// Removed unused imports: MailerSend, EmailParams, Recipient, Sender

// Helper function to format date/time nicely (KEPT AS IS)
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// HTML content generation function (KEPT AS IS)
const createEmailHtml = (booking: any): string => {
    // Determine if it's a Round Trip, One Way, or Rental
    let tripDuration = '';
    if (booking.bookingType === 'rental' && booking.rentalPackage) {
        tripDuration = booking.rentalPackage;
    } else if (booking.tripType === 'Round Trip' && booking.returnDate && booking.returnTime) {
        tripDuration = `${formatDate(booking.pickupDate)} at ${booking.pickupTime} to ${formatDate(booking.returnDate)} at ${booking.returnTime}`;
    } else {
        tripDuration = `${formatDate(booking.pickupDate)} at ${booking.pickupTime}`;
    }

    const destinationHtml = booking.destination
        ? `<div class="detail-row"><span class="detail-label">Destination</span><span class="detail-value">${booking.destination}</span></div>`
        : '';

    const returnDateHtml = booking.returnDate && booking.tripType !== 'One Way'
        ? `<div class="detail-row"><span class="detail-label">Return Date & Time</span><span class="detail-value">${formatDate(booking.returnDate)} at ${booking.returnTime}</span></div>`
        : '';

    const rentalPackageHtml = booking.rentalPackage
        ? `<div class="detail-row"><span class="detail-label">Package</span><span class="detail-value">${booking.rentalPackage}</span></div>`
        : '';

    const isAc = booking.ac === true || booking.ac === 'true' ? 'Yes' : 'No';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Booking Confirmation</title>
    <style>
        /* Import a standard, widely supported font */
        @import url('[https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap)');
        
        /* General Reset and Body Styles */
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: #f4f4f4; 
            margin: 0; 
            padding: 0; 
            -webkit-text-size-adjust: none; 
            -ms-text-size-adjust: none; 
        }
        
        /* Main Container */
        .container { 
            width: 100%; 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); 
        }
        
        /* Header Section */
        .header { 
            background-color: #212121; 
            padding: 24px; 
            text-align: center; 
        }
        .header img { 
            max-width: 100%; 
            height: auto; 
            display: block; 
            margin: 0 auto; 
            border-radius: 8px; 
        }
        .header h1 { 
            color: #ffffff; 
            font-size: 28px; 
            font-weight: 700; 
            margin: 16px 0 0; 
        }
        
        /* Content Section */
        .content { 
            padding: 24px; 
            color: #333333; 
        }
        
        /* Section Title (Subheadings) */
        .section-title { 
            font-size: 20px; 
            font-weight: 600; 
            color: #212121; 
            margin-top: 24px; 
            margin-bottom: 16px; 
        }
        
        /* Detail Row Layout */
        .detail-row { 
            display: flex; /* Standard CSS flexbox */
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #eeeeee; 
        }
        .detail-row:last-child { 
            border-bottom: none; 
        }
        
        /* Labels and Values */
        .detail-label { 
            font-size: 14px; 
            font-weight: 600; 
            color: #555555; 
        }
        .detail-value { 
            font-size: 14px; 
            font-weight: 400; 
            color: #777777; 
            text-align: right; 
        }
        
        /* Total Row Highlight */
        .total-row { 
            font-weight: 700; /* Increased weight for visibility */
            font-size: 16px; 
            color: #212121; 
        }

        /* Footer Section */
        .footer { 
            background-color: #f8f8f8; 
            padding: 24px; 
            text-align: center; 
            border-top: 1px solid #eeeeee; 
        }
        .footer p { 
            font-size: 12px; 
            color: #999999; 
            margin: 0; 
        }
        
        /* Ensuring good compatibility for tables (optional but good practice for emails) */
        table { border-collapse: collapse; width: 100%; }
        td, th { padding: 0; }
        
    </style>
</head>
<body>
    <div style="padding: 20px;"> <div class="container">
            <div class="header">
                <img src="https://img.freepik.com/free-photo/close-up-man-driving_23-2148622633.jpg?semt=ais_hybrid&w=740&q=80" 
                    alt="${booking.vehicleName}" 
                    onerror="this.onerror=null;this.src='[https://placehold.co/600x200/ffc233/FFFFFF?text=Easy+Go+Cab](https://placehold.co/600x200/ffc233/FFFFFF?text=Easy+Go+Cab)';">
                <h1>Booking Confirmed!</h1>
            </div>

            <div class="content">
                <p style="font-size: 16px; line-height: 1.5;">Hello ${booking.fullName},</p>
                <p style="font-size: 16px; line-height: 1.5;">Your car booking has been successfully confirmed. Here are your booking details:</p>

                <div class="section-title">Booking & Trip Details</div>
                <div class="details-section">
                    
                    <div class="detail-row">
                        <span class="detail-label">Customer Name : </span>
                        <span class="detail-value">${booking.fullName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Customer Email : </span>
                        <br/>
                        <span class="detail-value">${booking.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Customer Phone : </span>
                        <span class="detail-value">${booking.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="margin-top: 15px;">
                        <span class="detail-label">Booking Code : </span>
                        <br/>
                        <span class="detail-value">${booking.bookingCode}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Trip Type : </span>
                        <span class="detail-value">${booking.tripType || booking.bookingType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pickup Location : </span>
                        <span class="detail-value">${booking.pickupLocation}</span>
                    </div>
                    ${destinationHtml}
                    ${rentalPackageHtml}
                    <div class="detail-row">
                        <span class="detail-label">Pickup Date & Time : </span>
                        <span class="detail-value">${formatDate(booking.pickupDate)} at ${booking.pickupTime}</span>
                    </div>
                    ${returnDateHtml}
                </div>

                <div class="section-title">Vehicle Details : </div>
                <div class="details-section">
                    <div class="detail-row">
                        <span class="detail-label">Vehicle Name : </span>
                        <span class="detail-value">${booking.vehicleName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Vehicle Type : </span>
                        <span class="detail-value">${booking.vehicleType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Seats : </span>
                        <span class="detail-value">${booking.seats}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">A/C : </span>
                        <span class="detail-value">${isAc}</span>
                    </div>
                </div>

                <div class="section-title">Billing Summary : </div>
                <div class="details-section">
                    <div class="detail-row">
                        <span class="detail-label">Total Fare : </span>
                        <span class="detail-value">${booking.currency} ${booking.finalTotalFare}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Discount Applied : </span>
                        <span class="detail-value">- ${booking.currency} ${booking.discountApplied}</span>
                    </div>
                    <div class="detail-row total-row" style="background-color: #FFFBEB; padding: 12px 0;"> 
                        <span class="detail-label" style="color: #212121;">Amount Paid : </span>
                        <span class="detail-value" style="color: #212121; font-size: 16px;">${booking.currency} ${booking.amountPaid}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Remaining Balance : </span>
                        <span class="detail-value">${booking.currency} ${booking.remainingAmount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Status :  (${booking.paymentMethod})</span>
                        <span class="detail-value">${booking.paymentStatus.toUpperCase()}</span>
                    </div>
                </div>

                <p style="font-size: 16px; line-height: 1.5; margin-top: 30px;">
                    Thank you for choosing us! We look forward to serving you. Your booking code is 
                    <strong style="color: #212121;">${booking.bookingCode}</strong>.
                </p>
                <p style="font-size: 14px; color: #777777; line-height: 1.5;">
                    *The remaining balance is to be paid to the driver at the start/end of the trip.
                </p>

            </div>

            <div class="footer">
                <p>&copy; 2024 Your Company Name. All rights reserved.</p>
                <p>Support: ${booking.phone} | ${booking.email}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// --------------------------------------------------------------------------------
// NodeMailer Implementation
// --------------------------------------------------------------------------------

// Create a Nodemailer transporter using SMTP for Gmail
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL as string,     // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD as string, // Your App Password
    },
});


/**
 * Sends a booking confirmation email to the customer using NodeMailer.
 * @param booking - The booking object containing customer and trip details.
 * @param email - Optional email to override the one in the booking object.
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise.
 */
export const sendBookingConfirmationEmail = async (booking: any, email?: any): Promise<boolean> => {
    try {
        if (!booking.email) {
            console.warn('Cannot send email: Booking object is missing customer email.');
            return false;
        }

        // Check if environment variables are set
        if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
             console.error('Nodemailer Error: GMAIL_EMAIL or GMAIL_APP_PASSWORD environment variables are not set.');
             return false;
        }

        const receiverEmail = email ? email : booking.email;
        const senderName = "My Car Booking";
        const senderEmail = process.env.GMAIL_EMAIL as string; // Must match the `user` in transporter
        const subject = `Your Booking is Confirmed! - Code: ${booking.bookingCode}`;

        const emailHtml = createEmailHtml(booking);

        const emailText = `
        Booking Confirmation

        Dear ${booking.fullName},

        Thank you for your booking.

        Booking Code: ${booking.bookingCode}
        Pickup: ${booking.pickupLocation} on ${formatDate(booking.pickupDate)} at ${booking.pickupTime}
        Vehicle: ${booking.vehicleName} (${booking.vehicleType}, Seats: ${booking.seats})
        Total Fare: ${booking.finalTotalFare} ${booking.currency}
        Amount Paid: ${booking.amountPaid} ${booking.currency}
        Payment Status: ${booking.paymentStatus}
        `;

        const mailOptions: SendMailOptions = {
            from: `"${senderName}" <${senderEmail}>`, // Sender address
            to: receiverEmail,                        // List of receivers
            subject: subject,                         // Subject line
            html: emailHtml,                          // HTML body
            text: emailText,                          // Plain text body for fallback
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`Booking confirmation email sent successfully to ${receiverEmail}`);
        // info.messageId and info.response can be helpful for debugging
        return true;
    } catch (error) {
        console.error("Nodemailer error:", error);
        return false;
    }
};