import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AttandanceServices } from "./attandance.service";

// Controller for clocking in
const clockIn = catchAsync(async (req, res) => {
  const result = await AttandanceServices.clockInToDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Clocked in successfully",
    data: result,
  });
});

// Controller for clocking out
const clockOut = catchAsync(async (req, res) => {
  const result = await AttandanceServices.clockOutToDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Clocked out successfully",
    data: result,
  });
});


// Controller for starting a break
const breakStart = catchAsync(async (req, res) => {
  const result = await AttandanceServices.startBreakToDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Break started successfully",
    data: result,
  });
});


// Controller for ending a break
const breakEnd = catchAsync(async (req, res) => {
  const result = await AttandanceServices.endBreakToDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Break ended successfully",
    data: result,
  });
});


// Controller for fetching the attendance report
const getAttendanceReport = catchAsync(async (req, res) => {
  const { userId, startDate, endDate } = req.query; // Assuming the report query has these parameters
  const result = await AttandanceServices.getReport(userId as string, startDate as string, endDate as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attendance report fetched successfully",
    data: result,
  });
});




export const attandanceControllers = {
  getAttendanceReport,
  clockIn,
  clockOut,
  breakStart,
  breakEnd
};
