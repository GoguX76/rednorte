import { WaitlistRepository } from "../repositories/waitlist_repository";
import { type WaitlistEntry, VALID_STATUSES } from "../models/waitlist";

export class WaitlistService {
    private repository: WaitlistRepository;

    constructor() {
        this.repository = new WaitlistRepository();
    }

    // Añade un nuevo paciente a la lista de espera
    async addPatientToWaitlist(userId: string, priority: number, reason: string) {
        // Verifica que la prioridad este dentro del rango existente
        if (priority < 1 || priority > 4) {
            throw new Error("Nivel de prioridad inexistente")
        }

        // Verifica que el campo del motivo de consulta no este vacío o contenga muy poca información
        if (reason.trim().length === 0 || reason.trim().length < 5) {
                throw new Error("El campo de motivo no puede estar vacio | contiene menos de 5 carácteres")
        }

        // Verifica que exista un userId y que el campo no este vacío
        if (!userId) {
            throw new Error("El usuario debe estar asociado a un ID")
        }

        // Si todos los datos son correctos, ingresa al nuevo usuario
        const newEntry: WaitlistEntry = {
            userId,
            priority,
            reason,
            status: 'waiting'
        };

        return await this.repository.addToWaitlist(newEntry);
    };

    async getQueue() {
        return this.repository.getPendingPatients();
    };

    async updateStatus(id: number, newStatus: string) {
        if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
            throw new Error("El nuevo estado no es válido")
        }

        return await this.repository.updateStatus(id, newStatus);
    }
};