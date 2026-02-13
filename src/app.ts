import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { GlobalErrorHandler } from "./app/middleware/globalErrorHandler";
import { Not_Found } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";

const app: Application = express()

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cookieParser());

app.use("/api/v1", IndexRoutes)



// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use(GlobalErrorHandler)
app.use(Not_Found)

export default app;