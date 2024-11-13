/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();
router.get(
  "/",
  auth("admin"),
  UserControllers.getAllUser
);
router.get(
  "/:id",
 auth("admin"),
  UserControllers.getSingleUser
);

router.patch(
  "/:id",
  auth("admin"),
  UserControllers.updateUser
);


export const UserRoutes = router;
