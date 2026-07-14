import { AppError } from "./app-error";

export function handleError(err: Error): Response {
  const status = err instanceof AppError ? err.statusCode : 500;
  console.error(`[Error] ${status} - ${err.message}`);
  return Response.json({ success: false, message: err.message }, { status });
}
