import fs from "fs/promises";
import path from "path";
import { NextFunction, Request, Response } from "express";

// logs directory path
const logDir = path.resolve(process.cwd(), "logs");

// access log file path
const accessLogPath = path.join(logDir, "access.log");

// ensure logs directory exists
const ensureLogDir = async () => {
  await fs.mkdir(logDir, { recursive: true });
};

// request logger middleware
export const requestLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", async () => {
    try {
      const endTime = process.hrtime.bigint();

      // convert nanoseconds → milliseconds
      const responseTimeMs =
        Number(endTime - startTime) / 1_000_000;

      const logEntry = JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: Number(responseTimeMs.toFixed(2)),
        ip: req.ip,
        userAgent: req.get("user-agent") || "unknown",
      });

      console.log(logEntry);

      await ensureLogDir();

      await fs.appendFile(
        accessLogPath,
        `${logEntry}\n`,
        "utf-8"
      );
    } catch (error) {
      console.error("Failed to write access log:", error);
    }
  });

  next();
};