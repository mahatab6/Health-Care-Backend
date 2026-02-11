import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedresult = zodSchema.safeParse(req.body);

    if (!parsedresult.success) {
      next(parsedresult.error);
    }

    req.body = parsedresult.data;
    next();
  };
};
