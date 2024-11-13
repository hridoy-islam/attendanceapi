/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { attandanceControllers } from "./attandance.controller";

const router = express.Router();

// Route for clocking in
router.post(
  "/clockin",
  auth('admin', 'user'),
  attandanceControllers.clockIn // Controller method for handling clock-in logic
);

// Route for clocking out
router.post(
  "/clockout",
  auth('admin', 'user'),
  attandanceControllers.clockOut // Controller method for handling clock-out logic
);

// Route for starting a break
router.post(
  "/breakstart",
  auth('admin', 'user'),
  attandanceControllers.breakStart // Controller method for handling break start logic
);

// Route for ending a break
router.post(
  "/breakend",
  auth('admin', 'user'),
  attandanceControllers.breakEnd // Controller method for handling break end logic
);

// Route for getting attendance report (daily, monthly, or date range)
router.get(
  "/",
  auth('admin', 'user'),
 attandanceControllers.getAttendanceReport // Controller method for fetching attendance report
);

export const AttendanceRoutes = router;

