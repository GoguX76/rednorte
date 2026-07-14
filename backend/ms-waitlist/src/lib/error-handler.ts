import type { Context } from "hono";
import { AppError } from "./app-error";

/**
 * Handler centralizado de errores para Hono.
 *
 * Captura errores lanzados por los handlers y retorna una respuesta
 * JSON con el formato `{ success: false, message: string }`.
 *
 * - Si es un {@link AppError}, usa su `statusCode` específico
 * - Para cualquier otro error, retorna HTTP 500 (Internal Server Error)
 *
 * @param err - Error capturado (puede ser AppError o Error genérico)
 * @param c - Contexto de Hono para enviar la respuesta
 * @returns Respuesta JSON con el error formateado
 */
export function errorHandler(err: Error, c: Context) {
  const status = err instanceof AppError ? err.statusCode : 500;
  console.error(`[Error] ${status} - ${err.message}`);
  return c.json({ success: false, message: err.message }, status as any);
}

/**
 * Handler para rutas no encontradas (404).
 *
 * Se registra como middleware catch-all al final de las rutas
 * para capturar requests a endpoints inexistentes.
 *
 * @param c - Contexto de Hono
 * @returns Respuesta JSON con `{ success: false, message: "Ruta no encontrada" }` (404)
 */
export function notFoundHandler(c: Context) {
  return c.json({ success: false, message: "Ruta no encontrada" }, 404);
}
