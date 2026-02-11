import { catchAsync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { Request, Response } from "express";




const getAllDoctor = catchAsync (async(req: Request, res: Response) => {
    const result = await doctorService.getAllDoctor();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "get all doctor profile",
        data: result
    })
})


const getDoctorById = catchAsync (async (req: Request, res: Response) => {
    const {id} = req.params;
    const result = await doctorService.getDoctorById(id as string)
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "doctor profile info",
        data: result
    })
})


export const doctorController = {
    getAllDoctor,
    getDoctorById
}