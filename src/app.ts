/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";
// const requestIp = require('request-ip');

const app: Application = express();

// app.use(requestIp.mw());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


app.use(
  cors({
    origin: "*",
  })
);

// application routes
app.use("/api", router);

const test = async (req: Request, res: Response) => {
  return res.json({ message: "working nicely" });
};

app.get("/", test);

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
