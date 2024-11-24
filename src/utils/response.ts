import { Response } from "express";

/**
 * Send a success response
 * @param res - Express Response object
 * @param message - Message describing the success
 * @param data - Optional data payload
 * @returns JSON response with success status
 */
export const successResponse = (
  res: Response,
  message: string,
  data: object = {}
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param res - Express Response object
 * @param message - Error message to send
 * @param statusCode - HTTP status code (default: 400)
 * @returns JSON response with error status
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
