import { z } from "zod";

// Break Schema
const BreakSchema = z.object({
  breakStartTime: z.date(),
  breakEndTime: z.date().optional(),
});

// Session Schema for individual work sessions
const SessionSchema = z.object({
  clockIn: z.date(),
  clockOut: z.date().optional(),
  breaks: z.array(BreakSchema),
  totalWorkedHours: z.number().min(0), // calculated in hours for this session
  totalBreakHours: z.number().min(0), // calculated in hours for this session
  netHoursWorked: z.number().min(0), // calculated in hours after deducting breaks for this session
});

// Attendance Schema for creating a new attendance record (clock-in)
export const AttendanceCreateSchema = z.object({
  userId: z.string(),
  date: z.date(),
});

// Clock-out schema
export const ClockOutSchema = z.object({
  userId: z.string(),
  date: z.date(),
});

// Break start schema
export const BreakStartSchema = z.object({
  userId: z.string(),
  date: z.date(),
});

// Break end schema
export const BreakEndSchema = z.object({
  userId: z.string(),
  date: z.date(),
});

// Daily Attendance Query Schema
export const DailyAttendanceQuerySchema = z.object({
  userId: z.string(),
  date: z.date(),
});

// Report Query Schema for fetching attendance reports for a date range
export const ReportQuerySchema = z.object({
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

// Main Attendance Validation Schema, including sessions
const attendanceValidationSchema = z.object({
  userId: z.string(),
  date: z.date(),
  sessions: z.array(SessionSchema), // multiple sessions for a single day
  totalWorkedHours: z.number().min(0), // calculated as a sum of all session hours
  totalBreakHours: z.number().min(0), // calculated as a sum of all session break hours
  netHoursWorked: z.number().min(0), // total net hours after deducting breaks across all sessions
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const AttendanceValidation = {
  attendanceValidationSchema,
};
