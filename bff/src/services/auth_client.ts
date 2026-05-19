// Variable que almacena la URL con la que se conecta con el BFF
const AUTH_API_URL = "http://ms-users:3001/users/login";
const REGISTER_API_URL = "http://ms-users:3001/users";

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
  register: async (data: any) => {
    const response = await fetch(REGISTER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al registrar usuario");
    return await response.json();
  },

  findAllUsers: async () => {
    const response = await fetch("http://ms-users:3001/users");
    return await response.json();
  },

  findUserById: async (id: string) => {
    const response = await fetch(`http://ms-users:3001/users/${id}`);
    if (!response.ok) throw new Error("Usuario no encontrado");
    return await response.json();
  },
};
