import { catchAsync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { Request, Response } from "express";
import { IQueryParams } from "../../interface/query.interface";




const getAllDoctor = catchAsync (async(req: Request, res: Response) => {
    const query = req.query;
    console.log(query)
    const result = await doctorService.getAllDoctor(query as IQueryParams);
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
        message: "Doctor retrieved successfully",
        data: result
    })
})


const updateDoctor = catchAsync (async (req: Request, res: Response) => {
    const {id} = req.params;
    const payload = req.body;
    const result = await doctorService.updateDoctor(id as string, payload)
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor updated successfully",
        data: result
    })
})

const deleteDoctor = catchAsync (async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorService.deleteDoctor(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: result
    })
})


export const doctorController = {
    getAllDoctor,
    getDoctorById,
    updateDoctor,
    deleteDoctor
}