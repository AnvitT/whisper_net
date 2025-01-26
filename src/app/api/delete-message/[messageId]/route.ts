import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
    const messageId = await params.messageId

    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        },
        {
            status: 401
        })
    }

    try {
        const response = await UserModel.updateOne(
            { _id: user._id },
            { $pull: {messages: {_id: messageId}}}
        )
        if (response.modifiedCount == 0) {
            return Response.json({
                success: false,
                message: "Message not found or already deleted"
            },
                { status: 404 }
            )
        }
        return Response.json({
            success: true,
            message: "Message deleted"
        },
            { status: 200 }
        )
    } catch (error) {
        console.log("Error in deleting message route.")
        return Response.json({
            success: false,
            message: "Unexpected error while deleting message"
        },
            { status: 500 }
        )
    }
}