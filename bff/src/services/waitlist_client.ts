// Variable que almacena la URL con la que se conecta el BFF
const WAITLIST_API_URL = "http://ms-waitlist:3000/waitlist";

// Objeto constante que encapsula las funciones para comunicarnos con el ms-waitlist
export const WaitlistClient = {
  // Función asincrónica que añade pacientes a la lista con los parámetros requeridos
  addPatient: async (userId: string, priority: number, reason: string) => {
    const response = await fetch(WAITLIST_API_URL, {
      method: "POST", // Método CRUD para insertar los nuevos datos
      headers: {
        "Content-Type": "application/json", // Le decimos que los datos que se entregan son JSON
      },
      body: JSON.stringify({ userId, priority, reason }), // Transformamos los datos de texto a JSON
    });

    // Si hubo un error con la respuesta, manejamos el error aquí
    if (!response.ok) {
      throw new Error("No se pudo añadir al paciente a la lista");
    }

    // Retornamos la respuesta
    return await response.json();
  },

  // Función asincrónica que obtiene la lista de espera
  getQueue: async () => {
    const response = await fetch(WAITLIST_API_URL); // Obtiene la lista mediante la URL

    // Si no se pudo obtener la lista, se maneja el error en el if
    if (!response.ok) {
      throw new Error("No se pudo obtener la lista de espera");
    }

    // Retornamos la respuesta
    return await response.json();
  },

  // Función que actualiza el estado del paciente en la lista de espera
  updateStatus: async (id: number, newStatus: string) => {
    const response = await fetch(`${WAITLIST_API_URL}/${id}`, {
      method: "PATCH", // Cambia el estado del paciente del cual corresponde el ID
      headers: {
        "Content-Type": "application/json", // Le decimos que los datos que se entregan como JSON
      },
      body: JSON.stringify({ newStatus }), // Transforma a JSON
    });

    // Si no se pudo actualizar el estado del paciente, se maneja el error en el if
    if (!response.ok) {
      throw new Error("No se pudo actualizar el estado del paciente");
    }

    // Devolvemos la respuesta
    return await response.json();
  },
};
