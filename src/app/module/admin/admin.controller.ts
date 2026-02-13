import { Request, Response } from "express";
import { adminService } from "./admin.service";
import status from "http-status";



const getAllAdmin = async (req:Request, res:Response) => {
    const result = await adminService.getAllAdmin()
    res.status(status.OK).json({
        success: true,
        message: "All Admin retrieved successfully",
        data: result
    })
}



const getAdminById = async (req:Request, res:Response) => {
    const { id } = req.params
    const result = await adminService.getAdminById(id as string)
    res.status(status.OK).json({
        success: true,
        message: "Admin retrieved successfully",
        data: result
    })
}

export const adminController = {
    getAllAdmin,
    getAdminById
}