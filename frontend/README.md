# Frontend — RedNorte (Servicio Público de Salud)

Interfaz web del sistema de gestión de lista de espera médica.

## Ficha técnica

| Categoría | Detalle |
|---|---|
| **Lenguaje** | TypeScript 5 |
| **Framework web** | Astro 4 (SSG/SSR) |
| **Componentes** | Preact 10 |
| **Estilos** | Tailwind CSS 3 |
| **Estado global** | Nanostores |
| **Testing** | Vitest + happy-dom |
| **Cobertura** | `@vitest/coverage-v8` |
| **Tiempo real** | WebSocket nativo (Browser API) |
| **Patrones de diseño** | Atomic Design (componentes), Store (Nanostores), Hook pattern, Observer (WebSocket), Adapter (API client) |

## Scripts

```bash
bun run dev               # Servidor de desarrollo (puerto 4321)
bun run build             # Build estático
bun run preview           # Previsualizar build
bun run test               # Tests unitarios (29 tests)
bun run coverage            # Tests con cobertura
```

## Rutas

| Ruta | Página |
|---|---|
| `/` | Landing page |
| `/about` | Quiénes Somos |
| `/register` | Registro de usuario |
| `/login` | Inicio de sesión |
| `/waitlist` | Lista de espera |
| `/users` | Lista de usuarios |

## Estructura

```
src/
├── components/    # Componentes Preact
├── pages/         # Páginas Astro
├── stores/        # Estado global (Nanostores)
├── hooks/         # Hooks personalizados
├── layouts/       # Layouts
├── lib/           # Utilidades (cliente API)
└── styles/        # Estilos globales
```

## Ejecución

```bash
cd frontend
bun install
bun run dev
```

El frontend se conecta al API Gateway en `http://localhost:8080/api`.

## Tests

```bash
bun run test                 # Tests unitarios
bun run coverage             # Tests con cobertura
```
