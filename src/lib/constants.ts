export const sendVerificationEmailTemplate = (verificationLink: string) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff; color: #333; }
                table { width: 100%; border-collapse: collapse; }
                .container { max-width: 600px; width: 100%; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
                .header { padding: 25px 20px; text-align: center; background: #000; border-bottom: 1px solid rgba(0, 0, 0, 0.1); }
                .title { color: #ffffff; font-size: 26px; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 30px 20px; }
                .email-img { max-width: 200px; height: auto; display: block; margin: 0 auto 25px; border-radius: 10px; }
                .button { background: #000; color: #ffffff !important; padding: 14px 32px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 15px; text-transform: uppercase; }
                .button:hover { background: #333; }
                .text { color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
                .footer { padding: 20px; text-align: center; color: rgba(0,0,0,0.6); font-size: 12px; border-top: 1px solid rgba(0, 0, 0, 0.1); }
                .divider { height: 1px; background-color: rgba(0, 0, 0, 0.1); margin: 25px 0; }
                .card { background-color: #f8f8f8; border-radius: 8px; padding: 25px; margin: 20px 0; }
                .highlight { color: #000; font-weight: bold; }
                @media screen and (max-width: 600px) {
                    .container { width: 100% !important; }
                    .content { padding: 20px 15px; }
                    .title { font-size: 22px; }
                    .button { font-size: 14px; padding: 12px 24px; width: 80%; }
                    .text { font-size: 14px; }
                    .email-img { max-width: 180px; }
                }
            </style>
        </head>
        <body>
            <table role="presentation">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table role="presentation" class="container">
                            <tr>
                                <td class="header">
                                    <h2 class="title">Task Earn Money</h2>
                                </td>
                            </tr>
                            <tr>
                                <td class="content">
                                    <table width="100%">
                                        <tr>
                                            <td align="center" style="padding: 10px 0 20px;">
                                                <h2 style="color: #000; font-size: 24px; margin: 0;">Verify Your Email Account</h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="card">
                                                <p class="text">Hello,</p>
                                                <p class="text">
                                                    Thank you for registering with <span class="highlight">Task Earn Money</span>. To complete your registration and access website features, please verify your email address by clicking the button below.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding: 15px 0 25px;">
                                                <a href="${verificationLink}" class="button">VERIFY NOW</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td class="footer">
                                    <p style="margin: 0 0 10px;">© 2025 Barnvest. All rights reserved.</p>
                                    <p style="margin: 0;">If you have any questions, please contact our support team.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `
}
