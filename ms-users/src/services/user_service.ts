import { userRepository } from "../repositories/user_repository";

interface SignUpParams {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

export async function signUpUser(data: SignUpParams) {
    const { first_name, last_name, email, password } = data;

    // Lógica de validación de negocio
    if (!first_name || !email || !password) {
        // Lanzamos un error puro
        throw new Error("Missing required fields."); 
    }

    // Llamada al repositorio
    const userRepo = await userRepository();
    if (!userRepo) {
        throw new Error("Error de conexión con el repositorio.");
    }

    const userData = await userRepo.signUp({ first_name, last_name, email, password });
    
    // Retornamos la data pura
    return userData; 
}