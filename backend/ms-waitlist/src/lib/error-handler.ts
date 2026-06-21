import type { Context } from "hono";
import { AppError } from "./app-error";

export function errorHandler(err: Error, c: Context) {
  const status = err instanceof AppError ? err.statusCode : 500;
  console.error(`[Error] ${status} - ${err.message}`);
  return c.json({ success: false, message: err.message }, status as any);
}

export function notFoundHandler(c: Context) {
  return c.json({ success: false, message: "Ruta no encontrada" }, 404);
}
