import { Request, Response } from "express";
import { adminService } from "./admin.service";
import status from "http-status";
import { IRequestUser } from "../../interface/requestUser.interface";
import { IChangeUserRolePayload, IChangeUserStatusPayload } from "./admin.interface";



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


const updateAdmin = async (req:Request, res:Response) => {
    const { id } = req.params;
    const result = await adminService.updateAdmin(id as string, req.body)
    res.status(status.OK).json({
        success: true,
        message: "Admin updated successfully",
        data: result
    })
}


const adminDelete = async (req:Request, res:Response) => {
    const { id } = req.params;
    const result = await adminService.adminDelete(id as string)
    res.status(status.OK).json({
        success: true,
        message: "Admin deleted successfully",
        data: result
    })
}   
const changeUserStatus = async (req:Request, res:Response) => {
    const user = req.user as IRequestUser;
    const payload = req.body as IChangeUserStatusPayload
    const result = await adminService.changeUserStatus(user, payload)
    res.status(status.OK).json({
        success: true,
        message: "Admin deleted successfully",
        data: result
    })
}   
const changeUserRole = async (req:Request, res:Response) => {
    const user = req.user as IRequestUser;
    const payload = req.body as IChangeUserRolePayload
    const result = await adminService.changeUserRole(user, payload)
    res.status(status.OK).json({
        success: true,
        message: "Admin deleted successfully",
        data: result
    })
}   

export const adminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    adminDelete,
    changeUserRole,
    changeUserStatus
}