export const VALID_STATUSES = ["waiting", "attending", "finished", "cancelled"] as const;
export type WaitlistStatus = typeof VALID_STATUSES[number];

export interface WaitlistEntry {
  id?: number; // Como Postgres crea un ID nuevo, lo ponemos como opcional aquó
  userId: string; // ID del usuario que estará vinculado a la lista de espera
  priority: number; // Definimos la prioridad que tiene el usuario en la lista de espera
  status: WaitlistStatus; // Le damos el Type para darle los distintos estados
  reason: string | null; // Con reason explicamos el motivo de la consulta
  createdAt?: Date; // Fecha en la que fue creada esta entrada en la lista de espera
}
