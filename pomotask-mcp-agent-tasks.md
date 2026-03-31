# pomotask-mcp-agent-tasks.md

# Tareas para agentes — Pomotask MCP

Este backlog divide el trabajo entre **OpenHands** y **Jules** para que ambos
puedan trabajar en paralelo con bajo acoplamiento.

Principios:
- tareas pequeñas y auditables
- ownership claro
- handoff explícito
- integración al final
- Jules no solo documenta: también valida contrato, riesgos y consistencia

---

## 1. Reparto recomendado de responsabilidades

### OpenHands
Enfoque principal:
- implementación técnica
- wiring MCP
- tools
- capa de acceso a Convex
- tests técnicos

### Jules
Enfoque principal:
- contrato funcional
- QA de comportamiento
- edge cases
- documentación operativa
- auditoría de consistencia con CLI/backend

---

## 2. Tareas atómicas para OpenHands

### MCP-001 — Bootstrap del repositorio
**Objetivo**
Crear la base del repo `pomotask-mcp` con Node 22, TS estricto, pnpm y Vitest.

**Entregables**
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- estructura inicial `src/`
- `.env.example`

**Criterios de aceptación**
- `pnpm install` funciona
- `pnpm build` compila
- `pnpm test` corre aunque sea con tests placeholder

---

### MCP-002 — Implementar cliente Convex base
**Objetivo**
Crear `src/lib/convex.ts` con validación estricta de `CONVEX_URL` y `POMOTASK_AGENT_ID`.

**Entregables**
- `src/lib/convex.ts`

**Criterios de aceptación**
- falla claramente si faltan env vars
- usa `ConvexClient` de `convex`
- no usa `ConvexReactClient`

---

### MCP-003 — Implementar capa compartida Pomotask
**Objetivo**
Crear `src/lib/pomotask.ts` como capa reusable entre tools.

**Entregables**
- funciones base para list, create, claim, progress, complete, fail, comment, register, heartbeat, status

**Criterios de aceptación**
- la lógica de acceso a Convex queda centralizada
- las tools MCP solo delegan

---

### MCP-004 — Implementar manejo de errores
**Objetivo**
Crear `src/lib/errors.ts` para mapear errores a códigos MCP internos.

**Entregables**
- `src/lib/errors.ts`

**Criterios de aceptación**
- soporta `OK`, `NO_TASKS`, `NETWORK_ERROR`, `VALIDATION_ERROR`, `AGENT_ERROR`
- genera objetos de error machine-readable

---

### MCP-005 — Implementar normalización de progreso
**Objetivo**
Crear `src/lib/normalize.ts`.

**Entregables**
- función para colapsar whitespace
- función para forzar una sola línea
- truncado a 280 caracteres

**Criterios de aceptación**
- casos multiline y largos quedan normalizados

---

### MCP-006 — Montar el servidor MCP mínimo
**Objetivo**
Levantar el servidor MCP base e iniciar registro de tools.

**Entregables**
- `src/server/index.ts`
- wiring inicial del servidor

**Criterios de aceptación**
- el servidor inicia
- se pueden registrar tools mínimas

---

### MCP-007 — Implementar tool `task_claim`
**Objetivo**
Exponer la operación de claim como tool MCP.

**Criterios de aceptación**
- devuelve JSON válido
- devuelve `null` si no hay tareas
- errores mapeados correctamente

---

### MCP-008 — Implementar tool `task_progress`
**Objetivo**
Exponer progreso con normalización obligatoria.

**Criterios de aceptación**
- siempre normaliza el mensaje
- respeta límite de 280

---

### MCP-009 — Implementar tool `task_complete`
**Objetivo**
Exponer finalización de tarea.

**Criterios de aceptación**
- valida campos requeridos
- respuesta JSON consistente

---

### MCP-010 — Implementar tool `task_fail`
**Objetivo**
Exponer fallo de tarea.

**Criterios de aceptación**
- valida reason
- errores bien mapeados

---

### MCP-011 — Implementar tool `agent_heartbeat`
**Objetivo**
Exponer heartbeat del agente.

**Criterios de aceptación**
- actualiza estado del agente vía Convex
- falla claramente si el agente no existe

---

### MCP-012 — Implementar resto de tools mínimas
**Objetivo**
Agregar `task_list`, `task_create`, `task_comment`, `agent_register`, `agent_status`.

**Criterios de aceptación**
- tools registradas
- esquemas de input definidos
- respuestas JSON consistentes

---

### MCP-013 — Implementar `pnpm sync-types`
**Objetivo**
Sincronizar tipos generados de Convex.

**Entregables**
- `scripts/sync-types.ts`
- script en `package.json`

**Criterios de aceptación**
- copia `../pomotask/convex/_generated`
- falla con error claro si no existe

---

### MCP-014 — Tests unitarios y de integración técnica
**Objetivo**
Cubrir librerías y tools principales.

**Criterios de aceptación**
- tests para errors, normalize, pomotask layer
- tests de `task_claim`, `task_progress`, `task_complete`, `task_fail`, `agent_heartbeat`

---

## 3. Tareas atómicas para Jules

### MCP-QA-001 — Auditar consistencia del contrato MCP
**Objetivo**
Verificar que el contrato propuesto para MCP sea consistente con CLI y backend.

**Entregables**
- documento breve con hallazgos
- lista de divergencias y decisiones

**Criterios de aceptación**
- confirma nombres de operaciones
- confirma formato JSON esperado
- detecta incompatibilidades temprano

---

### MCP-QA-002 — Definir casos edge para herramientas críticas
**Objetivo**
Especificar edge cases antes o durante implementación.

**Cobertura mínima**
- env vars faltantes
- agente inválido
- timeout
- `task_claim` sin tareas
- `task_progress` multiline
- `task_progress` > 280 chars
- validación incompleta en `complete/fail/comment`

---

### MCP-QA-003 — Revisar que no haya fuga de responsabilidades
**Objetivo**
Asegurar que tools, capa Convex y servidor estén bien separados.

**Checklist**
- tools finas
- lógica compartida en `lib/`
- errores centralizados
- no lógica duplicada

---

### MCP-QA-004 — Validar estrategia de errores
**Objetivo**
Confirmar que todos los errores se devuelven con `code` y `message`.

**Criterios de aceptación**
- no se exponen stacks por defecto
- distingue errores reintentables de fatales

---

### MCP-QA-005 — Escribir guía de integración para agentes
**Objetivo**
Crear documentación para un agente consumidor del MCP.

**Contenido mínimo**
- tools disponibles
- inputs esperados
- outputs esperados
- cómo interpretar `null`
- cómo interpretar errores

---

### MCP-QA-006 — Crear matriz de pruebas funcionales
**Objetivo**
Definir casos de prueba por tool.

**Entregables**
- matriz tipo Given / When / Then
- happy path + edge cases

---

### MCP-QA-007 — Auditar sync de tipos y dependencias prohibidas
**Objetivo**
Validar que:
- sí se use `ConvexClient`
- no se use `ConvexReactClient`
- no se use `import.meta.env`
- sí exista `sync-types`

---

### MCP-QA-008 — Preparar release-readiness review
**Objetivo**
Emitir una revisión final antes de integrar con deployment real.

**Checklist**
- build limpio
- tests verdes
- contrato estable
- documentación mínima lista

---

## 4. Tareas de integración compartida

### MCP-INT-001 — Smoke test contra Convex real
**Owner inicial**: OpenHands  
**Validador**: Jules

**Objetivo**
Probar tools críticas contra un deployment real.

**Cobertura mínima**
- `task_claim`
- `task_progress`
- `task_complete`
- `task_fail`
- `agent_heartbeat`

---

### MCP-INT-002 — Contract parity con CLI
**Owner inicial**: Jules  
**Implementa ajustes**: OpenHands

**Objetivo**
Comparar CLI vs MCP para asegurar consistencia.

**Verificar**
- claim devuelve la misma forma de datos
- progress aplica mismas reglas
- complete/fail usan mismos campos
- semántica de errores equivalente

---

### MCP-INT-003 — README final del repo MCP
**Owner inicial**: Jules  
**Apoyo**: OpenHands

**Contenido mínimo**
- propósito
- instalación
- variables de entorno
- tools disponibles
- sync-types
- testing
- troubleshooting

---

## 5. Orden recomendado de ejecución

### Sprint 1
- MCP-001
- MCP-002
- MCP-004
- MCP-005
- MCP-006
- MCP-QA-001
- MCP-QA-002

### Sprint 2
- MCP-007
- MCP-008
- MCP-009
- MCP-010
- MCP-011
- MCP-014
- MCP-QA-003
- MCP-QA-004

### Sprint 3
- MCP-012
- MCP-013
- MCP-QA-005
- MCP-QA-006
- MCP-QA-007

### Sprint 4
- MCP-INT-001
- MCP-INT-002
- MCP-INT-003
- MCP-QA-008

---

## 6. Reglas de colaboración

- OpenHands no cambia el contrato sin dejar nota clara.
- Jules no reescribe implementación: audita, valida y propone ajustes concretos.
- Todo cambio de contrato debe reflejarse en docs.
- Toda divergencia respecto al CLI debe quedar documentada.
- Si una tarea cruza implementación y contrato, OpenHands implementa y Jules valida.

