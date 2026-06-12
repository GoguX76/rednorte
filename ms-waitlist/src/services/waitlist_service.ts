import { waitlistRepository } from "../repositories/waitlist_repository";
import { publishNotification } from "../rabbitmq/producer";
import {
  type WaitlistEntry,
  type WaitlistStatus,
  VALID_STATUSES,
} from "../models/waitlist";

export class WaitlistService {
  // Añade un nuevo paciente a la lista de espera
  async addPatientToWaitlist(
    data: Pick<WaitlistEntry, "userId" | "priority" | "reason">,
  ) {
    // Verifica que la prioridad este dentro del rango existente
    if (data.priority < 1 || data.priority > 4) {
      throw new Error("Nivel de prioridad inexistente");
    }

    // Verifica que el campo del motivo de consulta no este vacío o contenga muy poca información
    if (!data.reason || data.reason.trim().length < 5) {
      throw new Error(
        "El campo de motivo no puede estar vacio | contiene menos de 5 carácteres",
      );
    }

    // Verifica que exista un userId y que el campo no este vacío
    if (!data.userId) {
      throw new Error("El usuario debe estar asociado a un ID");
    }

    // Si todos los datos son correctos, ingresa al nuevo usuario
    const newEntry: WaitlistEntry = {
      userId: data.userId,
      priority: data.priority,
      reason: data.reason,
      status: "waiting",
    };

    return await waitlistRepository.addToWaitlist(newEntry);
  }

  // Obtiene la lista de todos los pacientes en la base de datos
  async getQueue() {
    return waitlistRepository.getPendingPatients(); // Usa la función del repositorio para obtener a todos los pacientes de la lista
  }

  // Actualiza el estado del paciente en la lista de espera
  async updateStatus(id: number, newStatus: WaitlistStatus) {
    // Valida que el nuevo estado del paciente este dentro de los permitidos en el sistema
    if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
      throw new Error("El nuevo estado no es válido");
    }
    // Guardamos el resultado en la base de datos
    const updatedEntry = await waitlistRepository.updateStatus(id, newStatus);
    // Si updatedEntry es nulo o indefinido, el ID no existía
    if (!updatedEntry) {
      throw new Error("Registro no encontrado en la lista de espera");
    }

    // Paquete que envía la información para la notificación
    const eventPayload = {
      userId: updatedEntry.user_id,
      type: "WAITLIST_STATUS_CHANGED",
      newStatus: newStatus,
      message: `El estado de tu turno ha cambiado a: ${newStatus}`,
      timestamp: new Date().toISOString(),
    };

    // En caso de que tenga un error, lanza un error pero continúa la ejecución del sistema
    publishNotification(eventPayload).catch((err) => {
      console.error(
        "[!] Hubo un error al enviar notificación a RabbitQM:",
        err,
      );
    });
    // Si todo salió bien, retornamos el resultado
    return updatedEntry;
  }
}
