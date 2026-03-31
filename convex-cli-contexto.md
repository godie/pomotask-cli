# Contexto para implementar Pomotask CLI (v1.1)

## 1. Propósito e identidad
El CLI es la interfaz exclusiva de los agentes LLM con el backend de Pomotask.
Los agentes lo invocan como proceso de línea de comandos para crear, reclamar,
actualizar, comentar, completar o fallar tareas.

El CLI NO es para uso humano directo. Es una herramienta para agentes.

## 2. Repositorio
- Repo independiente: `pomotask-cli`
- No pertenece al repo de la UI (`pomotask`)
- No crear monorepo

## 3. Stack
- Node.js 22
- TypeScript estricto
- Commander.js para comandos
- `ConvexClient` de `convex` para Node.js
- pnpm como gestor de paquetes
- Vitest para tests

## 4. Autenticación y entorno
Los agentes se autentican mediante variables de entorno:

```bash
CONVEX_URL=https://<deployment>.convex.cloud
POMOTASK_AGENT_ID=<id del agente registrado en Convex>
```

Reglas:
- `CONVEX_URL` es obligatoria
- `POMOTASK_AGENT_ID` es obligatoria
- No usar JWT
- No usar Convex Auth
- No usar `import.meta.env`
- En Node se usa `process.env`
- Si falta cualquiera de estas variables, el CLI debe terminar con **Exit Code 4**
- El `POMOTASK_AGENT_ID` debe existir en la tabla `agents` de Convex

## 5. Comandos del CLI

### task
```bash
pomotask task list [--status pending] [--type codegen] [--format json|human]
pomotask task create --title "..." --type codegen --project <projectId>
pomotask task claim --type codegen [--format json|human]
pomotask task progress <taskId> "mensaje" [--level info|warn|error]
pomotask task complete <taskId> --pr-url <url> --commit-sha <sha>
pomotask task fail <taskId> --reason "..."
pomotask task comment <taskId> --type clarification|response|context|progress --message "..."
```

### agent
```bash
pomotask agent register --name "codex-instance-1" --type codex --capabilities codegen,refactor
pomotask agent heartbeat
pomotask agent status
```

## 6. Estándares de salida
- Por defecto, todos los comandos responden en JSON
- `--format human` activa output legible para debugging
- Solo el JSON final va a `stdout`
- Logs de depuración, warnings y errores humanos van a `stderr`
- Nunca usar `console.log` directo fuera de la capa de salida
- Todo output debe pasar por `src/lib/output.ts`

Ejemplo JSON de `task claim` exitoso:

```json
{
  "id": "abc123",
  "title": "Refactor auth module",
  "type": "codegen",
  "projectId": "xyz789",
  "branchName": "refactor-auth-module-abc123",
  "baseBranch": "main"
}
```

Si no hay tarea disponible, `task claim` devuelve:

```json
null
```

## 7. Exit codes
| Código | Escenario | Acción esperada del agente |
|---|---|---|
| 0 | Éxito total | Continuar flujo |
| 1 | No hay tareas disponibles | Esperar / polling |
| 2 | Error de red o timeout de Convex | Reintentar inmediatamente |
| 3 | Error de validación o argumentos incorrectos | Corregir lógica o prompt y reintentar |
| 4 | Agente no existe, ID inválido, falta de env o no autorizado | Abortar y pedir intervención |

## 8. Mapeo obligatorio de errores Convex
El CLI debe capturar excepciones y transformarlas a exit codes estables.

| Tipo de error detectado | Exit code |
|---|---:|
| Respuesta exitosa | 0 |
| `task claim` sin tarea disponible (`null`) | 1 |
| Timeout > 10 segundos | 2 |
| Fallo de red, conexión, DNS, fetch o transporte | 2 |
| Error de validación de argumentos CLI | 3 |
| Error de validación de payload hacia Convex | 3 |
| `POMOTASK_AGENT_ID` faltante | 4 |
| `CONVEX_URL` faltante | 4 |
| Agente no encontrado / no autorizado | 4 |

Reglas:
- No propagar stack traces crudos a `stdout`
- El mensaje humano puede ir a `stderr`
- El código de salida es el contrato principal para los agentes

## 9. Política de timeout y reintentos
- Cada operación hacia Convex debe tener timeout duro de **10 segundos**
- Los timeouts deben mapearse a Exit Code 2
- El CLI no debe implementar backoff complejo
- El agente consumidor decide si reintenta, espera o aborta según exit code
- No reintentar dentro del comando cuando el error sea de validación o autorización

## 10. Restricciones de logs de progreso
El comando `task progress` debe:
- Normalizar el mensaje a una sola línea
- Colapsar whitespace repetido
- Eliminar saltos de línea
- Truncar a **280 caracteres** máximo
- Enviar el texto ya normalizado a Convex

Objetivo: evitar saturar la base de datos y mantener logs consistentes.

## 11. Flujo completo del agente
```bash
# 1. Reclamar tarea
TASK=$(pomotask task claim --type codegen --format json)
TASK_ID=$(echo $TASK | jq -r '.id')

# 2. Crear branch
git checkout -b $(echo $TASK | jq -r '.branchName')

# 3. Trabajar y reportar progreso
pomotask task progress $TASK_ID "Analizando dependencias..."
pomotask task progress $TASK_ID "Generando código..."

# 4a. Completar
pomotask task complete $TASK_ID \
  --pr-url "https://github.com/org/repo/pull/42" \
  --commit-sha "a1b2c3d"

# 4b. O fallar
pomotask task fail $TASK_ID --reason "Context window exceeded"
```

## 12. Estructura del repositorio
```text
pomotask-cli/
├── src/
│   ├── commands/
│   │   ├── task/
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   ├── claim.ts
│   │   │   ├── progress.ts
│   │   │   ├── complete.ts
│   │   │   ├── fail.ts
│   │   │   └── comment.ts
│   │   └── agent/
│   │       ├── register.ts
│   │       ├── heartbeat.ts
│   │       └── status.ts
│   ├── lib/
│   │   ├── convex.ts
│   │   ├── output.ts
│   │   ├── exitcodes.ts
│   │   └── errors.ts
│   └── index.ts
├── scripts/
│   └── sync-types.mjs
├── .env.example
├── AGENT.md
├── package.json
└── vitest.config.ts
```

## 13. Cliente Convex para Node.js
```ts
import { ConvexClient } from "convex";

const convexUrl = process.env.CONVEX_URL;
const agentId = process.env.POMOTASK_AGENT_ID;

if (!convexUrl || !agentId) {
  console.error("CONVEX_URL and POMOTASK_AGENT_ID are required");
  process.exit(4);
}

export const convex = new ConvexClient(convexUrl);
```

Reglas:
- No usar `ConvexReactClient`
- No usar `import.meta.env`
- No hardcodear URLs ni IDs

## 14. Relación con el backend
El CLI consume queries y mutations definidas en `pomotask/convex/`.

Mínimo esperado:
- `api.tasks.createTask`
- `api.tasks.claimTask`
- `api.tasks.reportProgress`
- `api.tasks.completeTask`
- `api.tasks.failTask`
- `api.tasks.commentTask`
- `api.agents.register`
- `api.agents.heartbeat`
- `api.agents.status`

## 15. Sincronización de tipos Convex
Se usará la estrategia local para TypeScript estricto.

Fuente:
- `../pomotask/convex/_generated`

Destino:
- `src/lib/convex/_generated`

Se debe proveer el script:

```bash
pnpm sync-types
```

Comportamiento esperado del script:
1. Verificar que exista `../pomotask/convex/_generated`
2. Copiar recursivamente su contenido a `src/lib/convex/_generated`
3. Fallar con mensaje claro si la fuente no existe
4. Permitir ejecución repetible

El CLI debe importar `api` desde la ruta local sincronizada, no desde el repo UI.

## 16. Estrategia de testing
Mínimo requerido:
- Tests unitarios para `output.ts`, `exitcodes.ts` y normalización de progreso
- Tests unitarios por comando
- Mocks de `ConvexClient`
- Tests de exit codes
- Tests de `stdout` vs `stderr`
- Tests del caso `task claim => null` con Exit Code 1
- Tests del script `pnpm sync-types`

Deseable:
- Snapshot tests del JSON final
- Tests de integración con un entorno controlado

## 17. Estándares de código
- TypeScript estricto
- No usar `any`
- Cada comando en su propio archivo
- Exit codes siempre desde `src/lib/exitcodes.ts`
- No mezclar lógica de Convex con parsing de comandos
- Mantener funciones puras donde sea posible
- Preferir composición sobre archivos gigantes

## 18. Concurrencia y claim de tareas
El sistema asume que el backend en Convex garantiza atomicidad al reclamar tareas.
El CLI no debe intentar resolver concurrencia localmente.

Regla operativa:
- `task claim` debe delegar en Convex
- Si no hay tarea disponible, devolver `null` y salir con Exit Code 1

## 19. Lo que NO se debe hacer
- No usar `ConvexReactClient`
- No usar `import.meta.env`
- No hardcodear URLs ni IDs
- No crear monorepo
- No agregar lógica de Git
- No implementar lógica de LLM
- No crear TUI ni UI interactiva
- No escribir logs arbitrarios en `stdout`
- No acoplar lógica de formato con la lógica de red

## 20. Variables de entorno documentadas
```bash
CONVEX_URL=https://<deployment>.convex.cloud
POMOTASK_AGENT_ID=<id del agente en Convex>
```

Documentar ambas en `.env.example`.
No agregar otras variables sin justificación explícita.

## 21. Journal del agente
- Leer `.jules/cli.md` antes de empezar si existe
- Crear `.jules/cli.md` si no existe
- Actualizar solo cuando se descubra algo no obvio o inesperado
- Mantener formato consistente con `.jules/convex.md`

## 22. Resultado esperado
Al finalizar:
- `pomotask task claim` reclama una tarea y devuelve JSON
- `pomotask task complete` marca la tarea como completada
- `pomotask task fail` marca la tarea como fallida
- `pomotask task progress` inserta logs consistentes y truncados
- `pomotask agent heartbeat` actualiza `lastSeenAt`
- Exit codes correctos en todos los casos
- `pnpm build` pasa sin errores
- Hay tests básicos para cada comando crítico
