/**
 * Error personalizado para errores controlados en la aplicación.
 *
 * Se usa en servicios y repositories para lanzar errores con un
 * código HTTP específico. El {@link errorHandler} los captura y
 * retorna la respuesta JSON correspondiente.
 */
export class AppError extends Error {
  /** Código HTTP de estado (ej: 400, 401, 404, 500). */
  statusCode: number;

  /**
   * @param message - Mensaje descriptivo del error (se retorna en la respuesta JSON)
   * @param statusCode - Código HTTP de estado (por defecto 400)
   */
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
