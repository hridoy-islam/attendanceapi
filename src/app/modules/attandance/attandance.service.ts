import AppError from "../../errors/AppError";
import moment from "moment";
import Attendance from "./attandance.model";
import { Types } from "mongoose";
import httpStatus from "http-status";

const clockInToDB = async (payload: { userId: string, clockInLat: number, clockInLng: number }) => {
  const { userId, clockInLat, clockInLng } = payload;

  // Get today's date without time for consistency
  const todayDate = moment().startOf("day").toISOString();

  // Check if an attendance record exists for the user today
  let attendance = await Attendance.findOne({
    userId: new Types.ObjectId(userId),
    date: todayDate,
  });

  if (attendance) {
    // Check if there is any active session without a clockOut
    const activeSession = attendance.sessions.find((session) => !session.clockOut);
    if (activeSession) {
      // If an active session is found, prevent a new clock-in and return an error
      throw new AppError(httpStatus.FORBIDDEN, 'You already have an active session. Please clock out before starting a new session.');
    }
  } else {
    // If no record exists for today, create a new attendance document
    attendance = new Attendance({
      userId: new Types.ObjectId(userId),
      date: todayDate,
      sessions: [],
      totalWorkedHours: 0,
      totalBreakHours: 0,
      netHoursWorked: 0,
    });
  }

  // Add a new session with clockIn time set to now
  attendance.sessions.push({
    clockIn: moment().toISOString(),
    clockInLat,
    clockInLng,
    breaks: [],
    totalWorkedHours: 0,
    totalBreakHours: 0,
    netHoursWorked: 0,
  });

  // Save the attendance document with the new session
  await attendance.save();
  return attendance;
};

const clockOutToDB = async (payload: { userId: string, clockOutLat: number, clockOutLng: number }) => {
  const { userId, clockOutLat, clockOutLng } = payload;

  // Get today's date at the start of the day in ISO format
  const todayDate = moment().startOf("day").toISOString();

  // Find the attendance record for today
  const attendance = await Attendance.findOne({
    userId: new Types.ObjectId(userId),
    date: todayDate,
  });

  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'No attendance record found for today. Please clock in first.');
  }

  // Find the most recent session without a clockOut time
  const currentSession = attendance.sessions.find((session) => !session.clockOut);
  if (!currentSession) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active session found to clock out from.');
  }

  // Set clockOut time to the current date-time in ISO format
  const clockOutTimeISO = moment().toISOString();
  currentSession.clockOut = clockOutTimeISO;
  currentSession.clockOutLat = clockOutLat;
  currentSession.clockOutLng = clockOutLng;

  // Calculate worked hours for the session
  const sessionWorkedDuration = moment(currentSession.clockOut).diff(moment(currentSession.clockIn), "hours", true);
  currentSession.totalWorkedHours = sessionWorkedDuration;

  // Calculate total break hours for the session
  const sessionBreakDuration = currentSession.breaks.reduce((total, breakSession) => {
    if (breakSession.breakEndTime) {
      return (
        total +
        moment(breakSession.breakEndTime).diff(moment(breakSession.breakStartTime), "hours", true)
      );
    }
    return total;
  }, 0);

  currentSession.totalBreakHours = sessionBreakDuration;
  currentSession.netHoursWorked = sessionWorkedDuration - sessionBreakDuration;

  // Recalculate totals for the entire day
  let totalWorkedHours = 0;
  let totalBreakHours = 0;
  attendance.sessions.forEach((session) => {
    totalWorkedHours += session.totalWorkedHours;
    totalBreakHours += session.totalBreakHours;
  });

  attendance.totalWorkedHours = totalWorkedHours;
  attendance.totalBreakHours = totalBreakHours;
  attendance.netHoursWorked = totalWorkedHours - totalBreakHours;

  // Save the attendance document with updated session and totals
  await attendance.save();
  return attendance;
};


// Service for starting a break
const startBreakToDB = async (payload: { userId: string, breakStartLat: number, breakStartLng: number }) => {
  const { userId, breakStartLat, breakStartLng } = payload;

  // Get today's date at the start of the day in ISO format
  const todayDateISO = moment().startOf("day").toISOString();

  // Find the attendance record for today
  const attendance = await Attendance.findOne({
    userId: new Types.ObjectId(userId),
    date: todayDateISO,
  });

  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'No attendance record found for today. Please clock in first.');
  }

  // Find the current active session (where clockOut is not yet set)
  const currentSession = attendance.sessions.find((session) => !session.clockOut);
  if (!currentSession) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active session found to start a break.');
  }

  // Check if there is already an ongoing break
  const ongoingBreak = currentSession.breaks.find((breakSession) => !breakSession.breakEndTime);
  if (ongoingBreak) {
    throw new AppError(httpStatus.NOT_FOUND, 'A break is already in progress.');
  }

  // Start a new break by adding a break with the current start time
  const breakStartTimeISO = moment().toISOString();
  currentSession.breaks.push({
    breakStartTime: breakStartTimeISO, 
    breakStartLat: breakStartLat,
    breakStartLng: breakStartLng,
  });

  // Save the attendance document with updated session and breaks
  await attendance.save();
  return attendance;
};


// Service for ending a break
const endBreakToDB = async (payload: { userId: string, breakEndLat: number, breakEndLng: number }) => {
  const { userId, breakEndLat, breakEndLng } = payload;

  // Get today's date at the start of the day in ISO format
  const todayDateISO = moment().startOf("day").toISOString();

  // Find the attendance record for today
  const attendance = await Attendance.findOne({
    userId: new Types.ObjectId(userId),
    date: todayDateISO,
  });

  if (!attendance) {
    throw new AppError(httpStatus.NOT_FOUND, 'No attendance record found for today. Please clock in first.');
  }

  // Find the current active session (where clockOut is not yet set)
  const currentSession = attendance.sessions.find((session) => !session.clockOut);
  if (!currentSession) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active session found to end a break.');
  }

  // Find the ongoing break (a break that has no end time yet)
  const ongoingBreak = currentSession.breaks.find((breakSession) => !breakSession.breakEndTime);
  if (!ongoingBreak) {
    throw new AppError(httpStatus.NOT_FOUND, 'No ongoing break found to end.');
  }

  // End the break by setting the current time as breakEndTime in ISO format
  ongoingBreak.breakEndTime = moment().toISOString();
  ongoingBreak.breakEndLat = breakEndLat;
  ongoingBreak.breakEndLng = breakEndLng;

  // Save the attendance document with the updated break end time
  await attendance.save();
  return attendance;
};

// Service for fetching the attendance report for a user within a date range
const getReport = async (userId: string, startDate: string, endDate: string) => {

  // Convert startDate and endDate to ISO date format for querying
  const startISO = moment(startDate).startOf("day").toISOString();
  const endISO = moment(endDate).endOf("day").toISOString();

  // Fetch attendance records for the user within the specified date range
  const attendanceRecords = await Attendance.find({
    userId: new Types.ObjectId(userId),
    date: {
      $gte: startISO,
      $lte: endISO,
    },
  });

  // Format each record to show daily totals and sessions with breaks
  const report = attendanceRecords.map((attendance) => {
    // Calculate total hours, break hours, and net hours for the day
    const dailyTotalWorkedHours = attendance.totalWorkedHours;
    const dailyTotalBreakHours = attendance.totalBreakHours;
    const dailyNetHoursWorked = attendance.netHoursWorked;

    // Format sessions with ISO dates and times
    const sessions = attendance.sessions.map((session) => ({
      clockIn: moment(session.clockIn).toISOString(),
      clockOut: session.clockOut ? moment(session.clockOut).toISOString() : null,
      totalWorkedHours: session.totalWorkedHours,
      totalBreakHours: session.totalBreakHours,
      netHoursWorked: session.netHoursWorked,
      breaks: session.breaks.map((breakSession) => ({
        breakStartTime: moment(breakSession.breakStartTime).toISOString(),
        breakEndTime: breakSession.breakEndTime ? moment(breakSession.breakEndTime).toISOString() : null,
      })),
    }));

    return {
      date: moment(attendance.date).format("YYYY-MM-DD"),
      totalWorkedHours: dailyTotalWorkedHours,
      totalBreakHours: dailyTotalBreakHours,
      netHoursWorked: dailyNetHoursWorked,
      sessions,
    };
  });

  return {
    userId,
    startDate: moment(startDate).format("YYYY-MM-DD"),
    endDate: moment(endDate).format("YYYY-MM-DD"),
    totalDays: report.length,
    report,
  };
};





export const AttandanceServices = {
  clockInToDB,
  clockOutToDB,
  startBreakToDB,
  endBreakToDB,
  getReport
};
