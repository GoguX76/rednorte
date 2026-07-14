import { AppError } from "./app-error";

/**
 * Handler centralizado de errores para Bun.serve (WebSocket server).
 *
 * A diferencia de los handlers de Hono, este retorna un objeto
 * `Response` nativo de Bun para ser usado en `Bun.serve()`.
 *
 * - Si es un {@link AppError}, usa su `statusCode` específico
 * - Para cualquier otro error, retorna HTTP 500 (Internal Server Error)
 *
 * @param err - Error capturado (puede ser AppError o Error genérico)
 * @returns Respuesta JSON con el error formateado
 */
export function handleError(err: Error): Response {
  const status = err instanceof AppError ? err.statusCode : 500;
  console.error(`[Error] ${status} - ${err.message}`);
  return Response.json({ success: false, message: err.message }, { status });
}
