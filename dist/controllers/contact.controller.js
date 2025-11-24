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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactUs = void 0;
const sendEmail_1 = require("../lib/sendEmail");
const createContactUs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject, and message are required.",
            });
        }
        // Check env vars
        if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
            console.error("Nodemailer Error: GMAIL_EMAIL or GMAIL_APP_PASSWORD environment variables are not set.");
            return res.status(500).json({
                success: false,
                message: "Email service is not configured properly.",
            });
        }
        // Define sender and receiver
        const senderEmail = process.env.GMAIL_EMAIL;
        const receiverEmail = process.env.GMAIL_EMAIL; // Send to admin (your email)
        const mailOptions = {
            from: `"Contact Form" <${senderEmail}>`,
            to: receiverEmail, // You can also send to multiple recipients
            subject: `📩 New Contact Us Message: ${subject}`,
            html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>New Contact Form Submission</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f4f4;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); border: 1px solid #dddddd;">
                    
                    <tr>
                      <td align="center" style="padding: 30px 20px 20px 20px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px; color: #ffffff; line-height: 30px;">
                          &#9993; New Contact Us Message
                        </h1>
                        <p style="margin: 5px 0 0 0; font-size: 16px; color: #ffffff;">
                          Subject: **${subject}**
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 30px 40px 10px 40px; color: #333333; font-size: 15px;">
                        <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #007bff;">
                          Customer Details:
                        </p>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="120" style="padding-bottom: 10px;"><strong>Name:</strong></td>
                            <td style="padding-bottom: 10px;">${name}</td>
                          </tr>
                          <tr>
                            <td width="120" style="padding-bottom: 10px;"><strong>Email:</strong></td>
                            <td style="padding-bottom: 10px;"><a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></td>
                          </tr>
                          ${phone ? `
                          <tr>
                            <td width="120" style="padding-bottom: 10px;"><strong>Phone:</strong></td>
                            <td style="padding-bottom: 10px;">${phone}</td>
                          </tr>
                          ` : ""}
                          <tr>
                            <td width="120" style="padding-bottom: 10px;"><strong>Subject:</strong></td>
                            <td style="padding-bottom: 10px;">${subject}</td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 10px 40px 30px 40px; color: #333333; font-size: 15px;">
                        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #007bff;">
                          Message:
                        </p>
                        <div style="padding: 15px; border: 1px solid #eeeeee; background-color: #f9f9f9; border-radius: 4px; line-height: 1.6;">
                          ${message}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                        This message was sent via your website's contact form.
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>

          </body>
          </html>
      `,
        };
        // Send email
        yield sendEmail_1.transporter.sendMail(mailOptions);
        console.log(`Contact form email sent successfully from ${email}`);
        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully!",
        });
    }
    catch (error) {
        console.error("Error sending contact email:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending your message.",
        });
    }
});
exports.createContactUs = createContactUs;
