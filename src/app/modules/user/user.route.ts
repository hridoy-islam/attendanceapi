/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "company", "creator", "user"),
  UserControllers.getAllUser
);
router.get("/:id", auth("admin", "user"), UserControllers.getSingleUser);

router.patch(
  "/:id",
  auth("admin", "user", "creator", "company"),
  UserControllers.updateUser
);

export const UserRoutes = router;
