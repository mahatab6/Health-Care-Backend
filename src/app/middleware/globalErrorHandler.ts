/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import e, { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { IErrorResponse, TErrorSources } from "../interface/error.interface";
import { handleZodErrors } from "../errorHelpers/handleZodErrors";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
export const GlobalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from global error handler", err);
  }

  if(req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }

  if(req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files.map(file => file.path);
    await Promise.all(imageUrls.map(url => deleteFileFromCloudinary(url)));
  }

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal server error";
  let stack: string | undefined = undefined;

  if (err instanceof z.ZodError) {
    const simplifiedErrors = handleZodErrors(err);

    statusCode = simplifiedErrors.statusCode as number;
    message = simplifiedErrors.message;
    errorSources.push(...simplifiedErrors.errorSources!);
  } else if(err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ]
  }
  
  else if(err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const errorResponse: IErrorResponse = {
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
    error: envVars.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
