/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";

export const GlobalErrorHandler = (err:any, req: Request, res: Response, next: NextFunction) => {
    if(envVars.NODE_ENV === "development") {
        console.log("Error from global error handler", err)
    }

    const statusCode: number = status.INTERNAL_SERVER_ERROR
    const message: string = "Internal server error"

  res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message
  })
}