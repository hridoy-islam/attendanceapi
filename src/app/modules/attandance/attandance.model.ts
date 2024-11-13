import mongoose, { Schema, Document, CallbackError, Types } from 'mongoose';
import moment from 'moment';
import { TAttendance } from './attandance.interface';

const BreakSchema = new Schema({
  breakStartTime: { type: String, required: true }, // Stored as ISO string
  breakStartLat: { type: Number, required: true },
  breakStartLng: { type: Number, required: true },
  breakEndTime: { type: String }, // Stored as ISO string
  breakEndLat: { type: Number },
  breakEndLng: { type: Number },
});

const SessionSchema = new Schema({
  clockIn: { type: String, required: true }, // Stored as ISO string
  clockInLat: { type: Number, required: true },
  clockInLng: { type: Number, required: true },
  clockOut: { type: String }, // Stored as ISO string
  clockOutLat: { type: Number },
  clockOutLng: { type: Number },
  breaks: [BreakSchema],
  totalWorkedHours: { type: Number, default: 0 },
  totalBreakHours: { type: Number, default: 0 },
  netHoursWorked: { type: Number, default: 0 }
});

const AttendanceSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Stored as ISO string
  sessions: [SessionSchema],
  totalWorkedHours: { type: Number, default: 0 },
  totalBreakHours: { type: Number, default: 0 },
  netHoursWorked: { type: Number, default: 0 }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

// Pre-save hook to calculate total hours for the day
AttendanceSchema.pre("save", function (next: (err?: CallbackError) => void) {
  const attendance = this as unknown as TAttendance & Document;

  let totalWorkedHours = 0;
  let totalBreakHours = 0;

  attendance.sessions.forEach((session) => {
    if (session.clockOut) {
      // Calculate worked hours for the session
      const clockInTime = moment(session.clockIn);
      const clockOutTime = moment(session.clockOut);
      const sessionWorkedDuration = clockOutTime.diff(clockInTime, 'hours', true); // in hours
      session.totalWorkedHours = sessionWorkedDuration;

      // Calculate break hours for the session
      const sessionBreakDuration = session.breaks.reduce((total, breakSession) => {
        if (breakSession.breakEndTime) {
          const breakStartTime = moment(breakSession.breakStartTime);
          const breakEndTime = moment(breakSession.breakEndTime);
          return total + breakEndTime.diff(breakStartTime, 'hours', true); // in hours
        }
        return total;
      }, 0);

      session.totalBreakHours = sessionBreakDuration;
      session.netHoursWorked = session.totalWorkedHours - session.totalBreakHours;

      // Accumulate total worked and break hours for the day
      totalWorkedHours += session.totalWorkedHours;
      totalBreakHours += session.totalBreakHours;
    }
  });

  // Set daily totals
  attendance.totalWorkedHours = totalWorkedHours;
  attendance.totalBreakHours = totalBreakHours;
  attendance.netHoursWorked = totalWorkedHours - totalBreakHours;

  next();
});

// Apply the type at the model level
const Attendance = mongoose.model<TAttendance & Document>('Attendance', AttendanceSchema);
export default Attendance;
