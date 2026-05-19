import type { Context } from "hono";
import { WaitlistClient } from "../services/waitlist_client";

// Definimos la estructura esperada del microservicio
interface WaitlistResponse {
  success: boolean;
  data: any[];
}

// Handler para añadir paciente a la lista
export const addPatientHandler = async (c: Context) => {
  try {
    const body = await c.req.json(); // Obtiene el JSON

    // Si faltan alguno de los datos requeridos, se maneja el error en el if
    if (!body.userId || !body.priority || !body.reason) {
      return c.json({ error: "Faltan introducir datos del paciente" }, 400);
    }

    // Si los datos son correctos, se insertan usando el método de addPatient de WaitlistClient
    const patientData = await WaitlistClient.addPatient(
      body.userId,
      body.priority,
      body.reason,
    );

    // Devuelve los datos actualizados con éxito
    return c.json(patientData, 201);

    // Aquí atrapamos el error devolviendo el status 503 (error del servidor)
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      503,
    );
  }
};

// Handler que obtiene la lista de espera
export const getQueueHandler = async (c: Context) => {
  try {
    const queueData = (await WaitlistClient.getQueue()) as WaitlistResponse; // Guardamos la lista en una variable usando el método getQueue de WaitlistClient

    // En caso de que la lista este vacía, devuelve éxito informándole al usuario
    if (queueData.data.length === 0) {
      return c.json(
        {
          success: true,
          message: "No hay pacientes en la lista actualmente",
          data: [],
        },
        200,
      );
    }

    // Devolvemos el resultado anterior con status 200 (éxito)
    return c.json(queueData, 200);

    // Aquí atrapamos el error devolviendo el status 503 (error del servidor)
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      503,
    );
  }
};

// Handler que actualiza el estado del paciente
export const updateStatusHandler = async (c: Context) => {
  try {
    const id = Number(c.req.param("id")); // Obtenemos el ID del Context
    const body = await c.req.json(); // Obtenemos todo el JSON en la variable body
    const { newStatus } = body; // Obtenemos el newStatus en el body para convertirlo en una variable suelta

    // Comprobamos que el ID es válido. si es un número y si newStatus es válido
    if (!id || isNaN(id) || !newStatus) {
      return c.json({ error: "ID inválido o falta el nuevo estado" }, 400);
    }

    // Guardamos en una variable los datos entregados con el método de updateStatus
    const updateResult = await WaitlistClient.updateStatus(id, newStatus);

    // Retornamos el resultado con status 200 (éxito)
    return c.json(updateResult, 200);

    // Aquí atrapamos el error devolviendo el status 503 si el servicio de lsitas no está disponible
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: "Servicio de listas de espera no disponible",
        details: error.message,
      },
      503,
    );
  }
};
