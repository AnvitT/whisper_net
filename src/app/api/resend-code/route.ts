import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username } = await request.json();
        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            });
        }

        if (user.isVerified) {
            return Response.json({
                success: false,
                message: "User is already verified"
            }, {
                status: 400
            });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyCode = verifyCode;
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        user.verifyCodeExpiry = expiryDate;
        await user.save();

        const emailResponse = await sendVerificationEmail(user.email, user.username, verifyCode);
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {
                status: 500
            });
        }

        return Response.json({
            success: true,
            message: "Verification code resent"
        }, {
            status: 200
        });

    } catch (error) {
        console.log("Error resending OTP: ", error);
        return Response.json({
            success: false,
            message: "Error resending OTP"
        }, {
            status: 500
        });
    }
}