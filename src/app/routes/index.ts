import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.router";
import { AttendanceRoutes } from "../modules/attandance/attandance.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: '/attendance',
    route: AttendanceRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
