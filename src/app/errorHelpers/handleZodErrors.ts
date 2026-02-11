import z from "zod";
import { IErrorResponse, TErrorSources } from "../interface/error.interface";
import status from "http-status";


export const handleZodErrors = (err: z.ZodError): IErrorResponse => {
    const errorSources: TErrorSources[] = []
    const statusCode = status.BAD_REQUEST;
    const message = "Zod Validation error";

    err.issues.forEach((issue) => { 
        errorSources.push({
            path: issue.path.join('.'),
            message: issue.message
        })
    });

    const errorResponse: IErrorResponse = {
        statusCode,
        success: false,
        message,
        errorSources
    }
    return errorResponse;
}