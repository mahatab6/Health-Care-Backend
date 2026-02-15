import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { cookieUtils } from "../../utils/cookie";

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

const getNewAccessToken = catchAsync ( async (req:Request, res: Response) => { 
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
        throw new AppError(status.BAD_REQUEST, "No refresh token provided");
    }

    const result = await authServices.getNewAccessToken(refreshToken, betterAuthSessionToken);

    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthCookie(res, sessionToken);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "New access token generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
            sessionToken,
        },
    }); 

})

const changePassword = catchAsync ( async (req:Request, res: Response) => {
    const payload = req.body;
    const sessionToken = req.cookies["better-auth.session_token"];
    const result = await authServices.changePassword(payload, sessionToken);
    const { accessToken, refreshToken, token } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthCookie(res, token as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Password changed successfully",
        data: {
            accessToken,
            refreshToken,
            token,
        },
    });
})

const logout = catchAsync ( async (req:Request, res: Response) => {
    const betterautToken = req.cookies["better-auth.session_token"];
    const result = await authServices.logout(betterautToken);

    cookieUtils.clearCookie(res, "accessToken", { httpOnly: true, secure: true, sameSite: "strict" });
    cookieUtils.clearCookie(res, "refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });
    cookieUtils.clearCookie(res, "better-auth.session_token", { httpOnly: true, secure: true, sameSite: "strict" });
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Logged out successfully",
        data: result,
    });
})

const verifyEmail = catchAsync ( async (req:Request, res: Response) => {
    const { email, otp } = req.body;
    await authServices.verifyEmail(email, otp);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Email verified successfully",
    });
})

const forgetPassword  = catchAsync ( async (req:Request, res: Response) => {
    const { email } = req.body;
    await authServices.forgetPassword(email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset email sent successfully",
    });
})

const resetPassword = catchAsync ( async (req:Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await authServices.resetPassword(email, otp, newPassword);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
    });
})

export const authController = {
    registerPatient,
    loginPatient,
    getNewAccessToken,
    changePassword,
    logout,
    verifyEmail,
    forgetPassword,
    resetPassword,
}