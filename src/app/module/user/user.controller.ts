import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";



const CreateDoctor = catchAsync(async(req:Request, res: Response) => {
    const payload = req.body;
    const result = await UserService.CreateDoctor(payload)
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Doctor profile created successfully",
        data: result
    })
})

export const UserController = {
    CreateDoctor
}