import { WaitlistService } from "../services/waitlist_service";
import type { Context } from "hono";

const service = new WaitlistService();

/**
 * Handler para agregar un paciente a la lista de espera.
 *
 * Recibe el body con userId, priority y reason, valida los datos
 * en el servicio y retorna la entrada creada.
 *
 * @param c - Contexto de Hono con el body de la petición
 * @returns Respuesta JSON con `{ success: true, data: WaitlistEntry }` (201)
 */
export const addPatientHandler = async (c: Context) => {
  const body = await c.req.json();
  const newPatient = await service.addPatientToWaitlist(body);
  return c.json({ success: true, data: newPatient }, 201);
};

/**
 * Handler para obtener todas las entradas de la lista de espera.
 *
 * Retorna los pacientes con estado `waiting` ordenados por
 * prioridad (urgente primero) y fecha de creación.
 *
 * @param c - Contexto de Hono
 * @returns Respuesta JSON con `{ success: true, data: WaitlistEntry[] }` (200)
 */
export const getQueueHandler = async (c: Context) => {
  const queue = await service.getQueue();
  return c.json({ success: true, data: queue }, 200);
};

/**
 * Handler para obtener las entradas de lista de espera del usuario autenticado.
 *
 * Extrae el userId del payload JWT y filtra las entradas de la lista
 * de espera que pertenecen a ese usuario.
 *
 * @param c - Contexto de Hono con el JWT payload inyectado por el middleware
 * @returns Respuesta JSON con `{ success: true, data: WaitlistEntry[] }` (200)
 */
export const getMyQueueHandler = async (c: Context) => {
  const payload: any = c.get('jwtPayload');
  const userId = payload.id;
  const queue = await service.getMyQueue(userId);
  return c.json({ success: true, data: queue }, 200);
};

/**
 * Handler para actualizar el estado de una entrada en la lista de espera.
 *
 * Valida que el ID sea numérico, extrae el nuevo estado del body
 * y delega al servicio la actualización y publicación del evento.
 *
 * @param c - Contexto de Hono con el parámetro `id` en la URL y `newStatus` en el body
 * @returns Respuesta JSON con la entrada actualizada (200) o error (400/404)
 */
export const updateStatusHandler = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({success: false, message: "ID inválido"}, 400);
  }
  const body = await c.req.json();
  const updateStatus = await service.updateStatus(id, body.newStatus);
  return c.json({ success: true, data: updateStatus }, 200);
};
