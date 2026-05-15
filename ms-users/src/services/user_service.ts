import { userRepository } from "../repositories/user_repository";
import { v4 as uuidv4 } from "uuid";
import type { UserEntry } from "../models/user";

export class UserService {
    // Función que registra el usuario e implementa lógica de negocio
    async registerUser(userData: UserEntry) {
        // Validamos si los campos tienen datos
        if (!userData.first_name || !userData.email || !userData.password) {
            throw new Error("Los campos obligatorios se encuentran vacíos")
        }

        // Almacenamos el resultado del repositorio para la función de encontrar por correo
        const existingEmail = await userRepository.findByEmail(userData.email);

        // Si el correo existe, lanza error
        if (existingEmail) {
            throw new Error("El correo ya existe")
        }

        // Almacenamos el resultado del repositorio para función de encontrar por la key de role
        const roleId = await userRepository.findRoleIdByKey('patient');

        // Si no se encuentra la key del rol en la DB, lanza error
        if (!roleId) {
            throw new Error("El rol paciente no existe en la base de datos")
        }

        const hashedPassword = await Bun.password.hash(userData.password); // Hasheamos la contraseña
        userData.password = hashedPassword; // Cambiamos el password de userData a la password hasheada

        const newUserId = uuidv4(); // Crea una ID con un texto aleatorio
        const newUser = await userRepository.createUser(newUserId, userData, roleId) // Crea al usuario con los datos que trabajamos
        return newUser; // Retorna los nuevos datos
    }

    // Función que retorna los datos de todos los usuarios
    async findUsers() {
        return userRepository.findAllUsers();
    }

    // Función que retorna los datos de un usuario mediante su ID
    async findUserById(id: string) {
        const user = await userRepository.findUserById(id); // Devuelve el ID que retorna el repository y lo guarda en una const

        // Si el ID del usuario no existe, lanza error
        if (!user) {
            throw new Error("Usuario no encontrado")
        }

        // Si el ID del usuario existe, retorna el resultado
        return user;
    }

    async loginUser(userData: Pick<UserEntry, "email" | "password">) {
        // Validamos que los campos tengan datos
        if (!userData.email || !userData.password) {
            throw new Error("Faltan credenciales")
        }

        // Obtiene el correo del usuario y lo guarda en una constante
        const credentials = await userRepository.getUserCredentials(userData.email);

        // Si el correo es inválido lanza error
        if(!credentials) {
            throw new Error("Credenciales inválidas")
        }

        // Comprueba si la contraseña normal y hasehada con iguales con Bun
        const isPasswordValid = await Bun.password.verify(userData.password, credentials.password);

        // Si la contraseña es inválida lanza error
        if (!isPasswordValid) {
            throw new Error("Credenciales inválidas")
        }

        // Retorna los datos necesarios
        return {
            id: credentials.id,
            email: credentials.email,
            role_id: credentials.role_id
        };
    }
}
