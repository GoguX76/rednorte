// Variable que almacena la URL con la que se conecta con el BFF
const AUTH_API_URL = "http://ms-users:3001/users/login";

// Objeto constante que contiene los métodos para la autenticación en el login
export const AuthClient = {
  login: async (email: string, password: string) => {
    //Método que manda las credenciales a la URL en formato JSON
    const response = await fetch(AUTH_API_URL, {
      method: "POST", // Envía las credenciales al microservicio de ms-users
      headers: {
        "Content-Type": "application/json", // Sube las credenciales en formato JSON
      },
      body: JSON.stringify({ email, password }), // Manda los datos email y password en formato JSON gracias a stringify
    });

    // Lanza un error si las credenciales no son válidas o si hubo un error en el servidor
    if (!response.ok) {
      throw new Error("Credenciales inválidas o error en el servidor");
    }

    // Devuelve los datos al controlador del BFF
    return await response.json();
  },
};
