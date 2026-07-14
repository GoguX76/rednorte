/**
 * Representación de un usuario en el sistema hospitalario.
 *
 * Se almacena en la tabla `users` de PostgreSQL y se usa a través
 * de todo el microservicio de usuarios para autenticación y gestión.
 *
 * @property id - UUID generado automáticamente por PostgreSQL
 * @property email - Correo electrónico único (usado como identificador de login)
 * @property first_name - Nombre del usuario
 * @property last_name - Apellido del usuario
 * @property password - Contraseña hasheada con Argon2 (nunca se retorna en respuestas)
 * @property phone - Número de teléfono (opcional)
 * @property role_id - UUID del rol asignado en la tabla `roles`
 * @property is_active - Indica si el usuario puede autenticarse (soft delete)
 * @property is_verified - Indica si el email fue verificado
 * @property created_at - Timestamp de creación de la cuenta
 * @property updated_at - Timestamp de la última actualización de datos
 */
export interface UserEntry {
    id?: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    phone?: string;
    role_id?: string;
    is_active?: boolean;
    is_verified?: boolean;
    created_at?: Date;
    updated_at?: Date;
}