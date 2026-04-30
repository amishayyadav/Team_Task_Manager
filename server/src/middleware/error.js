import { ZodError } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFound(_req, _res, next) {
  next(ApiError.notFound("Route not found"));
}

function fieldErrorsFromZod(err) {
  const out = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    out[key] = out[key] || [];
    out[key].push(issue.message);
  }
  return out;
}

function fieldErrorsFromMongoose(err) {
  const out = {};
  for (const [key, e] of Object.entries(err.errors)) {
    out[key] = [e.message];
  }
  return out;
}

export function errorHandler(err, _req, res, _next) {
  if (env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      fieldErrors: fieldErrorsFromZod(err),
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      fieldErrors: fieldErrorsFromMongoose(err),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
    });
  }

  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message || "Error",
    ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}
