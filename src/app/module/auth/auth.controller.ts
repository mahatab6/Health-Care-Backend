import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";

const registerPatient = catchAsync( async (req: Request, res: Response) => {
    const payload = req.body
    const result = await authServices.registerPatient(payload);
    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Patient account created",
        data: result
    })
})


const loginPatient = catchAsync ( async (req:Request, res: Response) => {
    const payload = req.body;
    const result = await authServices.loginPatient(payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User loging successfully",
        data: result
    })
})



export const authController = {
    registerPatient,
    loginPatient
}