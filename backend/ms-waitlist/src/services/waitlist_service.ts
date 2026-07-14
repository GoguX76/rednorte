import { waitlistRepository } from "../repositories/waitlist_repository";
import { publishNotification } from "../rabbitmq/producer";
import {
  type WaitlistEntry,
  type WaitlistStatus,
  VALID_STATUSES,
} from "../models/waitlist";
import { AppError } from "../lib/app-error";

/**
 * Servicio de gestión de la lista de espera hospitalaria.
 *
 * Contiene la lógica de negocio para agregar pacientes, consultar
 * la cola y actualizar estados. Publica eventos a RabbitMQ cada
 * vez que se produce un cambio de estado para notificaciones.
 */
export class WaitlistService {
  /**
   * Agrega un nuevo paciente a la lista de espera.
   *
   * Flujo:
   * 1. Valida que la prioridad esté entre 1 y 4
   * 2. Valida que el motivo tenga al menos 5 caracteres
   * 3. Valida que el userId esté presente
   * 4. Crea la entrada con estado inicial `waiting`
   * 5. Publica un evento `WAITLIST_STATUS_CHANGED` a RabbitMQ
   *
   * @param data - Datos de la entrada (userId, priority, reason)
   * @returns La entrada creada con su ID y estado `waiting`
   * @throws {AppError} Si la prioridad no está en rango 1-4 (400)
   * @throws {AppError} Si el motivo tiene menos de 5 caracteres (400)
   * @throws {AppError} Si falta el userId (400)
   */
  async addPatientToWaitlist(
    data: Pick<WaitlistEntry, "userId" | "priority" | "reason">,
  ) {
    if (data.priority < 1 || data.priority > 4) {
      throw new AppError("Nivel de prioridad inexistente");
    }

    if (!data.reason || data.reason.trim().length < 5) {
      throw new AppError(
        "El campo de motivo no puede estar vacio | contiene menos de 5 carácteres",
      );
    }

    if (!data.userId) {
      throw new AppError("El usuario debe estar asociado a un ID");
    }

    const newEntry: WaitlistEntry = {
      userId: data.userId,
      priority: data.priority,
      reason: data.reason,
      status: "waiting",
    };

    const result = await waitlistRepository.addToWaitlist(newEntry);

    const eventPayload = {
      userId: data.userId,
      type: "WAITLIST_STATUS_CHANGED",
      newStatus: "waiting",
      message: "Has sido añadido a la lista de espera con estado: waiting",
      timestamp: new Date().toISOString(),
    };

    publishNotification(eventPayload).catch((err) => {
      console.error(
        "[!] Hubo un error al enviar notificación a RabbitQM:",
        err,
      );
    });

    return result;
  }

  /**
   * Obtiene todas las entradas de la lista de espera.
   *
   * Retorna las entradas ordenadas por prioridad (urgente primero)
   * y fecha de creación (más antigua primero).
   *
   * @returns Arreglo de entradas de la lista de espera
   */
  async getQueue() {
    return waitlistRepository.getPendingPatients();
  }

  /**
   * Obtiene las entradas de lista de espera de un usuario específico.
   *
   * @param userId - UUID del usuario cuyas entradas se desean consultar
   * @returns Arreglo de entradas del usuario
   */
  async getMyQueue(userId: string) {
    return waitlistRepository.findByUserId(userId);
  }

  /**
   * Actualiza el estado de una entrada en la lista de espera.
   *
   * Flujo:
   * 1. Valida que el nuevo estado sea uno de los permitidos
   * 2. Actualiza el registro en la base de datos
   * 3. Publica un evento `WAITLIST_STATUS_CHANGED` a RabbitMQ
   *
   * @param id - ID numérico de la entrada a actualizar
   * @param newStatus - Nuevo estado deseado
   * @returns La entrada actualizada con su nuevo estado
   * @throws {AppError} Si el estado no es válido (400)
   * @throws {AppError} Si la entrada no existe (404)
   */
  async updateStatus(id: number, newStatus: WaitlistStatus) {
    if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
      throw new AppError("El nuevo estado no es válido");
    }

    const updatedEntry = await waitlistRepository.updateStatus(id, newStatus);

    if (!updatedEntry) {
      throw new AppError("Registro no encontrado en la lista de espera", 404);
    }

    const eventPayload = {
      userId: updatedEntry.user_id,
      type: "WAITLIST_STATUS_CHANGED",
      newStatus: newStatus,
      message: `El estado de tu turno ha cambiado a: ${newStatus}`,
      timestamp: new Date().toISOString(),
    };

    publishNotification(eventPayload).catch((err) => {
      console.error(
        "[!] Hubo un error al enviar notificación a RabbitQM:",
        err,
      );
    });

    return updatedEntry;
  }
}
