import { Context } from "hono";
import { UserService } from "../services/user_service";

const service = new UserService(); // Variable que importa las funciones del Service

export const registerUserHandler = async (c: Context) => {
  try {
    const body = await c.req.json(); // Recibe los datos que envia el usuario

    const newUser = await service.registerUser(body);

    // En caso de ser éxitoso, retornamos status 201
    return c.json({ success: true, data: newUser }, 201);
  } catch (error: any) {
    // En caso de error, retornamos status 400
    return c.json({ success: false, message: error.message }, 400)
  } 
}

// Función que nos devuelve los usuarios ingresados en la base de datos
export const findUsersHandler = async (c: Context) => {
  try {
    const users = await service.findUsers(); // Guardamos la lista de usuarios en una constante

    // En caso de ser éxitoso, retornamos status 200
    return c.json({ success: true, data: users, }, 200)
  } catch (error: any){
    // En caso de error, retornamos status 500
    return c.json({ success: false, message: error.message }, 500)
  }
}

export const findUserByIdHandler = async (c: Context) => {
  try {
    // Toma el ID del usuario
    const id = c.req.param("id");

    // Validamos si Hono no puedo extraer el ID del usuario
    if (!id) {
      return c.json({ success: false, message: "La ID en la URL es obligatoria" }, 400);
    }
    
    // Le pasamos el id que obtuvimos a la función del service y la almacenamos en una constante
    const user = await service.findUserById(id);

    // En caso de ser éxitoso, retornamos status 200
    return c.json({success: true, data: user}, 200)
  } catch (error: any) {
    // En caso de error, retornamos status 500
    return c.json({ success: false, message: error.message }, 404)
  }
}

export const loginUserHandler = async (c: Context) => {
  try {
    const body = await c.req.json()

    const userData = await service.loginUser(body)

    return c.json({success: true, data: userData}, 200);

  } catch (error: any) {
    return c.json({success: false, message: error.message}, 401)
  }
}