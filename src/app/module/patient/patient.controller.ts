import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { PatientService } from "./patient.service";
import { IRequestUser } from "../../interface/requestUser.interface";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";



const updateProfile = catchAsync(async (req: Request, res:Response) => {
    const user = req.user as IRequestUser
    const payload = req.body

    const result = await PatientService.updateProfile(user, payload);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Patient profile update successfully",
        data: result
    })
})

export const PatientController = {
    updateProfile
}