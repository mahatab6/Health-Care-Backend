import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jewUtils } from "./jwt";
import { envVars } from "../../config/env";
import { cookieUtils } from "./cookie";

import { Response } from "express";


const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jewUtils.createToken(payload, envVars.TOKEN_SECRET, {expiresIn: envVars.TOKEN_EXPIRES_IN} as SignOptions)

    return accessToken
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jewUtils.createToken(payload, envVars.REFRESH_SECRET, {expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN} as SignOptions)
    return refreshToken
}

const setAccessTokenCookie = (res: Response, token:string) => {
    cookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 1000,
    })
}

const setRefreshTokenCookie = (res: Response, token: string) => {

    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 1000 * 7,
    })
}

const setBetterAuthCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 1000
    })
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthCookie
}