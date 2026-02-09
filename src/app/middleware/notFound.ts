import { Request, Response } from "express";
import status from "http-status";

export const Not_Found = (req: Request, res: Response) => {
    res.status(status.NOT_FOUND).json({
        success: false,
        message: `your request not found ${req.url}`
    })
}