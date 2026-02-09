/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";


const createSpecialty = async (req:Request, res: Response) => {
    try {
        const payload = req.body;
        const result = await SpecialtyService.createSpecialty(payload);
        res.status(201).json({
            success: "true",
            data: result
        })
    } catch (error:any) {
        res.status(422).json({
            success: "false",
            message: "create specialties failed",
            error: error
        })
    }
}


const getAllSpecialties = async (req: Request, res: Response) => {
    try {
        const result = await SpecialtyService.getAllSpecialties();
        res.status(200).json({
            success: "true",
            data: result
        })
    } catch (error:any) {
        console.log(error)
        res.status(404).json({
            success: "false",
            message: "Not found",
            error: error.message
        })
    }
}

const deleteSpecialties = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const result = await SpecialtyService.deleteSpecialties(id as string)
        res.status(200).json({
            success: "true",
            message: "Delete success",
            data: result
        })
    } catch (error:any) {
        console.log(error)
        res.status(404).json({
            success: "false",
            message: "Not found",
            error: error.message
        })
    }
}

const updateSpecialties = async (req: Request, res: Response) => {
    try {
        const title = req.body.title;
        const {id} = req.params;
        const result = await SpecialtyService.updateSpecialties(title, id as string)
        res.status(200).json({
            success: "true",
            message: "Specialties update",
            data: result
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: "false",
            message: "Update failed",
            error: error.message
        })
    }
}

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialties,
    updateSpecialties
}