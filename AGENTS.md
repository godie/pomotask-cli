# AGENTS.md — Pomotask CLI

## Misión
Implementar y mantener el CLI oficial de Pomotask para agentes LLM.

Este repositorio expone un contrato de línea de comandos:
- determinista
- auditable
- automatizable

El CLI NO contiene lógica de negocio.
Solo traduce comandos → llamadas a Convex → salida JSON + exit codes.

---

## Reglas no negociables

- Node.js 22
- TypeScript estricto
- Usar `ConvexClient` de `convex`
- NO usar `ConvexReactClient`
- NO usar `import.meta.env`
- NO usar `any`
- NO hardcodear URLs, IDs o credenciales
- NO mezclar parsing CLI con lógica de Convex
- NO usar `console.log` fuera de `src/lib/output.ts`

### Output discipline
- Solo JSON final en `stdout`
- Todo debugging / errores humanos → `stderr`

---

## Contrato operativo

### Variables requeridas

```
CONVEX_URL=https://<deployment>.convex.cloud
POMOTASK_AGENT_ID=<agent-id>
```

Si falta alguna → exit code 4.

---

### Exit codes

| Código | Significado |
|------|------------|
| 0 | Éxito |
| 1 | No hay tareas disponibles |
| 2 | Error de red / timeout |
| 3 | Error de validación |
| 4 | Agente inválido o entorno incorrecto |

---

### Output

- JSON por defecto
- `--format human` solo debugging
- JSON final → stdout
- Logs → stderr

---

## Arquitectura esperada

```
src/
  commands/
    task/
    agent/
  lib/
    convex.ts
    output.ts
    exitcodes.ts
    errors.ts
  index.ts
scripts/
  sync-types.mjs
```

---

## Backend contract

- Importar `api` desde:
  `src/lib/convex/_generated/api`

- No depender en runtime del repo `pomotask`

---

## Implementación

### lib/

- `convex.ts`
  - valida env vars
  - inicializa cliente
- `output.ts`
  - controla stdout/stderr
- `exitcodes.ts`
  - constantes centralizadas
- `errors.ts`
  - mapea errores Convex → exit codes

---

### Commands

#### task
- list
- create
- claim
- progress
- complete
- fail
- comment

#### agent
- register
- heartbeat
- status

---

## Reglas de progreso

`task progress` debe:

- normalizar a una línea
- truncar a 280 caracteres
- soportar `--level info|warn|error`

---

## Sync-types

`pnpm sync-types` debe:

- validar existencia de:
  `../pomotask/convex/_generated`
- copiar a:
  `src/lib/convex/_generated`
- fallar con error claro si no existe

---

## Desarrollo guiado por pruebas (TDD)

### Flujo obligatorio

1. RED → escribir test que falle
2. GREEN → implementar mínimo
3. REFACTOR → mejorar sin romper tests

---

### Reglas TDD no negociables

- No implementar features sin test previo
- Todo bug → primero test que lo reproduzca
- Si modificas archivo sin tests → agregar tests
- No hacer refactors grandes sin cobertura
- Tests deben validar comportamiento, no implementación interna

---

### Cobertura mínima requerida

- exit codes
- JSON output
- stdout/stderr
- env validation
- error mapping
- `task progress` normalization
- `task claim` sin tareas
- sync-types

---

## Journal

- Leer `.jules/cli.md` antes de empezar
- Actualizar solo si hay algo relevante/no obvio

---

## Criterios de done

- Compila
- Respeta contrato JSON
- Exit codes correctos
- Tests relevantes
- No rompe restricciones

---

## Paridad con MCP

El CLI es la referencia base.
El MCP debe mantener equivalencia semántica.
