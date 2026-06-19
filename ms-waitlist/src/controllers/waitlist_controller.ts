import { WaitlistService } from "../services/waitlist_service";
import type { Context } from "hono";

const service = new WaitlistService(); // Variable que importa los métodos del servicio de waitlist

// Función que permite añadir a un paciente a la lista de espera
export const addPatientHandler = async (c: Context) => {
  try {
    const body = await c.req.json(); // Recibe los datos que envía el usuario

    // Añade un nuevo paciente a la lista de espera con los datos obtenidos anteriormente
    const newPatient = await service.addPatientToWaitlist(body);

    return c.json({ success: true, data: newPatient }, 201); // Retorna éxito si los datos son correctos
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400); // Retorna un error si los datos son inválidos
  }
};

// Función que permite mostrarnos los pacientes en la lista de espera
export const getQueueHandler = async (c: Context) => {
  try {
    const queue = await service.getQueue(); // Usamos la función del service para obtener a los pacientes en la lista de espera
    return c.json({ success: true, data: queue }, 200); // Devuelve la lista con los pacientes en caso de éxito
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500); // Devuelve un error si hubo un problema con el servidor
  }
};

// Función que permite a un usuario ver solo sus propias entradas en la waitlist
export const getMyQueueHandler = async (c: Context) => {
  try {
    const payload: any = c.get('jwtPayload');
    const userId = payload.id;
    const queue = await service.getMyQueue(userId);
    return c.json({ success: true, data: queue }, 200);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 500);
  }
};

// Función que permite actualizar el estado de un paciente en la lista de espera
export const updateStatusHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param("id")); // Toma el id del paciente
    // Evaluamos si el ID es válido
    if (Number.isNaN(id)) {
      return c.json({success: false, message: "ID inválido"}, 400)
    }

    const body = await c.req.json(); // Recibe los datos que envía el usuario
    const updateStatus = await service.updateStatus(id, body.newStatus); // Actualiza el estado del paciente con los nuevos parametros

    return c.json({ success: true, data: updateStatus }, 200); // Devuelve éxito si los datos son correctos
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400); // Devuelve error si los datos son inválidos
  }
};
