import nodemailer from 'nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

async function generateEmailContent(username: string, verifyCode: string) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome to Whisper Net, ${username}!</h2>
                <p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
                <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 24px; letter-spacing: 4px; margin: 20px 0;">
                    <strong>${verifyCode}</strong>
                </div>
                <p>This code will expire in 1 hour.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
        </body>
        </html>
    `;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse> {
    try {
        const emailHtml = await generateEmailContent(username, verifyCode);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Whisper Net Verification Code",
            html: emailHtml,
            text: `Hi ${username}, your verification code is: ${verifyCode}`
        });

        return { success: true, message: "Verification email sent" };
    } catch (error) {
        console.error("Error sending verification email: ", error);
        return { success: false, message: "Error sending verification email" };
    }
}