# pomotask-mcp-contexto.md

# Contexto para implementar Pomotask MCP

Este documento define el alcance, restricciones y lineamientos para implementar
un servidor MCP (Model Context Protocol) para Pomotask.

El MCP NO reemplaza al CLI. Ambos tienen propósitos distintos:
- **CLI**: interfaz de línea de comandos para flujos deterministas de agentes.
- **MCP**: interfaz estructurada para que clientes compatibles con MCP consulten y operen Pomotask mediante herramientas tipadas.

---

## 1. Propósito

El servidor MCP expone capacidades de Pomotask como herramientas seguras,
predecibles y orientadas a agentes.

Debe permitir al agente:
- consultar tareas
- reclamar trabajo
- reportar progreso
- completar o fallar tareas
- comentar tareas
- consultar estado del agente
- enviar heartbeat

El objetivo es que clientes MCP puedan integrarse con Pomotask sin depender
necesariamente del CLI.

---

## 2. Relación con el CLI

El MCP y el CLI deben compartir el mismo contrato funcional.

Reglas:
- No duplicar reglas de negocio si puede evitarse.
- Extraer un núcleo reutilizable en librerías comunes del repo MCP si hace falta.
- El MCP debe respetar las mismas reglas de autenticación, validación y mapeo de errores que el CLI.
- Si existe divergencia entre CLI y MCP, el contrato de backend de Convex manda.

Recomendación:
- Implementar una capa `src/lib/pomotask.ts` o similar para centralizar acceso a Convex.
- Las tools MCP deben ser wrappers finos sobre esa capa.

---

## 3. Repositorio

El MCP debe vivir en un repositorio separado: `pomotask-mcp`

No mezclarlo con:
- `pomotask` (UI/backend principal)
- `pomotask-cli`

No crear monorepo en esta fase.

---

## 4. Stack

- Node.js 22
- TypeScript estricto
- SDK MCP oficial para TypeScript/Node
- Convex client para Node.js (`ConvexClient` de `convex`)
- pnpm
- Vitest

No usar:
- `ConvexReactClient`
- `import.meta.env`
- lógica de UI

---

## 5. Autenticación

El MCP se autentica con variables de entorno:

```bash
CONVEX_URL=https://<deployment>.convex.cloud
POMOTASK_AGENT_ID=<id del agente registrado en Convex>
```

Reglas:
- Ambas variables son obligatorias.
- Si falta cualquiera, el servidor no debe iniciar correctamente.
- `POMOTASK_AGENT_ID` debe existir en la tabla `agents` de Convex.
- No usar JWT, sesiones de usuario ni Convex Auth.

---

## 6. Objetivo funcional del MCP

El MCP debe exponer herramientas tipadas que representen operaciones reales de Pomotask.

Herramientas mínimas:

### task
- `task_list`
- `task_create`
- `task_claim`
- `task_progress`
- `task_complete`
- `task_fail`
- `task_comment`

### agent
- `agent_register`
- `agent_heartbeat`
- `agent_status`

Opcional para fase 2:
- `task_get`
- `task_retry`
- `project_list`
- `task_history`

---

## 7. Contrato de herramientas

Cada tool debe:
- tener nombre claro y estable
- validar input con schema estricto
- devolver respuesta JSON estructurada
- no imprimir ruido adicional
- mapear errores de forma consistente

Ejemplo conceptual:

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

Si no hay tarea disponible en `task_claim`, devolver:

```json
null
```

No inventar formatos alternativos.

---

## 8. Mapeo de errores

Aunque MCP no depende de exit codes como el CLI, sí debe conservar la semántica.

Mapeo interno obligatorio:

| Escenario | Código interno | Comportamiento esperado |
| :--- | :---: | :--- |
| Éxito | `OK` | devolver resultado |
| No hay tareas disponibles | `NO_TASKS` | devolver `null` sin tratarlo como excepción fatal |
| Error de red / timeout | `NETWORK_ERROR` | error reintentable |
| Error de validación | `VALIDATION_ERROR` | error corregible por el agente |
| Agente inválido / no autorizado | `AGENT_ERROR` | error fatal |

Reglas:
- Los errores deben incluir mensaje legible para agente.
- Deben incluir un campo machine-readable como `code`.
- No exponer stacks innecesarios al cliente MCP.

Formato sugerido:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "taskId is required"
  }
}
```

---

## 9. Timeout y retry policy

El MCP debe proteger al cliente de llamadas colgadas.

Reglas:
- Timeout de red por operación: 10 segundos.
- Errores de red/timeout deben marcarse como reintentables.
- Errores de validación no deben reintentarse automáticamente.
- Errores de agente inválido no deben reintentarse.

---

## 10. Restricciones para `task_progress`

El campo `message` debe:
- normalizarse a una sola línea
- colapsar whitespace repetido
- truncarse a 280 caracteres

Motivo:
- evitar spam en Convex
- mantener logs compactos y útiles para agentes

---

## 11. Sincronización de tipos Convex

Se debe usar un script:

```bash
pnpm sync-types
```

El script debe:
1. verificar que exista `../pomotask/convex/_generated`
2. copiarlo recursivamente a `src/lib/convex/_generated`
3. fallar con error claro si no existe la fuente

El MCP debe importar `api` desde la ruta local sincronizada.

---

## 12. Estructura sugerida del repositorio

```text
pomotask-mcp/
├── src/
│   ├── server/
│   │   └── index.ts
│   ├── tools/
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
│   │   ├── pomotask.ts
│   │   ├── errors.ts
│   │   ├── normalize.ts
│   │   └── convex/
│   │       └── _generated/
│   └── index.ts
├── scripts/
│   └── sync-types.ts
├── .env.example
├── package.json
├── vitest.config.ts
└── README.md
```

---

## 13. Estándares de código

- TypeScript estricto. No usar `any`.
- Cada tool en su propio archivo.
- Separar validación, acceso a Convex y adaptación MCP.
- No mezclar wiring del servidor con lógica de negocio.
- Toda normalización compartida va en `src/lib/`.
- Toda traducción de errores va en `src/lib/errors.ts`.

---

## 14. Testing Strategy

Se requieren tres niveles mínimos:

### Unit tests
- validación de inputs
- mapeo de errores
- normalización de `task_progress`
- serialización de respuestas

### Integration-like tests
- tools llamando a una capa mockeada de Pomotask
- verificación de contratos JSON
- manejo de `null` en `task_claim`

### Contract tests
- garantizar consistencia con el contrato definido para CLI/backend
- especialmente para `claim`, `progress`, `complete`, `fail`

---

## 15. Lo que NO se debe hacer

- No usar `ConvexReactClient`.
- No usar `import.meta.env`.
- No hardcodear URLs o agent IDs.
- No mezclar MCP con CLI en el mismo repo.
- No agregar UI.
- No inventar herramientas fuera del dominio sin necesidad.
- No duplicar lógica de validación en muchos lugares.
- No devolver texto libre cuando debe devolverse JSON estructurado.

---

## 16. Resultado esperado

Al finalizar:
- el servidor MCP inicia correctamente con variables válidas
- las tools mínimas de task y agent funcionan
- los errores se devuelven con código y mensaje consistentes
- `task_claim` devuelve `null` cuando no hay trabajo
- `task_progress` normaliza y trunca mensajes
- `pnpm build` pasa
- `pnpm test` pasa
- la documentación permite a otro agente integrar el MCP sin adivinar comportamiento

---

## 17. Recomendación de implementación por fases

### Fase 1
- bootstrap del repo
- server MCP mínimo
- `lib/convex.ts`
- `lib/errors.ts`
- `lib/normalize.ts`
- `task_claim`
- `task_progress`
- `task_complete`
- `task_fail`
- `agent_heartbeat`

### Fase 2
- resto de tools
- sync-types
- tests de contrato
- documentación de integración

### Fase 3
- endurecimiento
- contract checks cruzados con CLI
- README final
- smoke test contra deployment real

