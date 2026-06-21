// Creamos una interfaz para definir los atributos que tendrá el usuario en el sistema
export interface UserEntry {
    id?: string; // Al Postgre asignar la ID, lo ponemos como opcional
    email: string; // Email del usuario
    first_name: string; // Primer nombre del usuario
    last_name: string // Apellido del usuario
    password: string; // Contraseña del usuario
    phone?: string; // Teléfono del usuario (Opcional)
    role_id?: string // Rol del usuario en el sistema
    is_active?: boolean; // Define si el usuario está activo en el sistema o no
    is_verified?: boolean; // Verifica que el usuario está verificado en el sistema
    created_at?: Date; // Fecha en la que se crea la cuenta
    updated_at?: Date; // Fecha en la que se actualizan los datos de la cuenta
}