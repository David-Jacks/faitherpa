import { Response } from "express";

export const sendError = (
  res: Response,
  status: number,
  code: string,
  message?: string,
) => {
  const payload: any = { error: code };
  if (message) payload.message = message;
  return res.status(status).json(payload);
};

export default sendError;
