import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { sendResponse } from "../../shared/sendResponse"
import status from "http-status"


const getStats = catchAsync (async(req: Request, res: Response) => {
   console.log("connected")
})


const ingestDoctors = catchAsync(async(req: Request, res: Response) => {

    const result = await RAGService

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Doctor data ingestion"
    })
})


export const RagController = {
    getStats,
    ingestDoctors
}