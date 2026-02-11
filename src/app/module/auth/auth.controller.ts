import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync( async (req: Request, res: Response) => {
    const payload = req.body
    const result = await authServices.registerPatient(payload);

    const {accessToken, refreshToken, token, ...rest} = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthCookie(res, token as string)

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Patient account created",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
})


const loginPatient = catchAsync ( async (req:Request, res: Response) => {
    const payload = req.body;
    const result = await authServices.loginPatient(payload);

    const {accessToken, refreshToken, token, ...rest} = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthCookie(res, token)

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User loging successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
})



export const authController = {
    registerPatient,
    loginPatient
}