# AGENT.md — Pomotask MCP

## Misión
Implementar el servidor MCP de Pomotask.

Este servidor permite a clientes MCP interactuar con Pomotask mediante tools estructuradas.

El MCP NO contiene lógica de negocio.

---

## Reglas no negociables

- Node.js 22
- TypeScript estricto
- NO usar `any`
- NO duplicar lógica del CLI
- NO hardcodear valores
- NO exponer errores crudos

---

## Principio clave

El MCP debe ser equivalente al CLI en comportamiento.

---

## Arquitectura esperada

```
src/
  server/
    mcp.ts
    tools/
      tasks/
      agent/
  lib/
    pomotask.ts
    errors.ts
    schemas.ts
```

---

## Tools

### tasks
- claim_task
- report_progress
- complete_task
- fail_task
- list_tasks
- create_task
- comment_task

### agent
- register_agent
- heartbeat_agent
- get_agent_status

---

## Manejo de errores

Formato:

```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

---

## Desarrollo guiado por pruebas (TDD)

### Flujo obligatorio

1. RED
2. GREEN
3. REFACTOR

---

### Reglas

- cada tool debe tener tests
- validar input/output/errores
- cubrir edge cases
- no implementar sin test previo

---

### Cobertura mínima

- registro de tools
- validación de inputs
- respuestas exitosas
- errores normalizados
- timeouts
- casos sin tareas
- consistencia con CLI

---

## Paridad CLI ↔ MCP

| CLI | MCP |
|-----|----|
| task claim | claim_task |
| task progress | report_progress |
| task complete | complete_task |
| task fail | fail_task |
| agent heartbeat | heartbeat_agent |

---

## Criterios de done

- tool registrada
- contrato válido
- errores normalizados
- tests pasan
- consistente con CLI
