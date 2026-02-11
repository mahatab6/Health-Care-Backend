/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import e, { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { IErrorResponse, TErrorSources } from "../interface/error.interface";
import { handleZodErrors } from "../errorHelpers/handleZodErrors";



export const GlobalErrorHandler = (err:any, req: Request, res: Response, next: NextFunction) => {
    if(envVars.NODE_ENV === "development") {
        console.log("Error from global error handler", err)
    }

    const errorSources: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR
    let message: string = "Internal server error"

    if(err instanceof z.ZodError) {
      const simplifiedErrors = handleZodErrors(err);

       statusCode = simplifiedErrors.statusCode as number;
       message = simplifiedErrors.message;
       errorSources.push(...simplifiedErrors.errorSources!);
    }

    const errorResponse:IErrorResponse = {
      success: false,
      message,
      errorSources,
      error: envVars.NODE_ENV === "development" ? err : undefined
    }

  res.status(statusCode).json(errorResponse)
}