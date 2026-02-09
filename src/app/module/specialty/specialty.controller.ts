/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await SpecialtyService.createSpecialty(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtyService.getAllSpecialties();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "find all specialties",
    data: result,
  });
});

const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtyService.deleteSpecialties(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Now Delete specialties",
    data: result,
  });
});

const updateSpecialties = catchAsync(async (req: Request, res: Response) => {
  const title = req.body.title;
  const { id } = req.params;
  const result = await SpecialtyService.updateSpecialties(title, id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Update successfuly",
    data: result,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialties,
  deleteSpecialties,
  updateSpecialties,
};
