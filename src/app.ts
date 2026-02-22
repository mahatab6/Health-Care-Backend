import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { GlobalErrorHandler } from "./app/middleware/globalErrorHandler";
import { Not_Found } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";
import cors from "cors";
import { envVars } from "./config/env";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from 'node-cron'
import { AppointmentService } from "./app/module/appointment/appointment.service";

const app: Application = express()

app.use(cors({
    origin: [envVars.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.set('view engine', 'ejs');
app.set('views', path.resolve(process.cwd(), 'src/app/templates'));

app.use('/api/auth', toNodeHandler(auth)) // Mount better-auth routes under /api/auth

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

// Middleware to parse JSON bodies
app.use(express.json());

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", IndexRoutes)

cron.schedule('*/25 * * * *', async () => {
  
  try {
    console.log('running a task every minute');
    await AppointmentService.cancelUnPaidAppointment()
  } catch (error: any) {
    console.log(`Unpaid appointment error ${error}`)
  }
});


// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use(GlobalErrorHandler)
app.use(Not_Found)

export default app;