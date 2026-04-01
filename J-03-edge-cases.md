# J-03: Diseño de Casos Borde por Comando (Actualizado)

Esta guía define los casos borde críticos que deben ser probados para asegurar la robustez del Pomotask CLI.

## 1. Tareas (Commands: task)

| Comando | Escenario Borde | Comportamiento Esperado | Estado | Prioridad |
| :--- | :--- | :--- | :---: | :---: |
| `task progress` | Mensaje con saltos de línea y emojis | Normalizado a una línea y espacios colapsados. | ✅ | Alta |
| `task progress` | Mensaje de 500+ caracteres | Truncado a 280 caracteres con "..." al final. | ✅ | Alta |
| `task progress` | ID de tarea inexistente | Exit Code 2 (o 3 si el backend lo valida como error de input). | ⚠️ | Media |
| `task progress` | Nivel de log inválido | Error de validación de Commander o fallback a "info". | ✅ | Baja |
| `task claim` | No hay tareas del tipo solicitado | Output JSON `null` y Exit Code 1. | ✅ | Alta |
| `task claim` | Tipo de tarea vacío o inválido | Exit Code 3. | ✅ | Media |
| `task list` | No hay tareas en el sistema | Output JSON `[]` y Exit Code 0. | ✅ | Media |
| `task list` | Filtros con caracteres especiales | Correctamente sanitizados/escapados en la query a Convex. | ⚠️ | Baja |
| `task create` | Título o ProjectID extremadamente largo | Validación del backend (Exit Code 3). | ⚠️ | Media |
| `task complete` | PR URL inválida (no es una URL) | Exit Code 3 (Validación local). | ✅ | Alta |
| `task complete` | Commit SHA mal formado | Exit Code 3 (Validación local). | ✅ | Alta |
| `task comment` | Tipo de comentario desconocido | Exit Code 3. | ⚠️ | Media |
| `task comment` | Mensaje vacío | Exit Code 3. | ✅ | Alta |

## 2. Agente (Commands: agent)

| Comando | Escenario Borde | Comportamiento Esperado | Estado | Prioridad |
| :--- | :--- | :--- | :---: | :---: |
| `agent register` | Nombre de agente duplicado | El backend puede retornar error o actualizar el existente (Exit Code 0/3). | ⚠️ | Media |
| `agent register` | Capacidades vacías | Permitido o error de validación (Exit Code 0/3). | ⚠️ | Baja |
| `agent heartbeat` | `POMOTASK_AGENT_ID` válido pero no existe en DB | Exit Code 4. | ⚠️ | Alta |
| `agent status` | `POMOTASK_AGENT_ID` válido pero no existe en DB | Exit Code 4. | ⚠️ | Alta |

## 3. Globales

| Escenario | Comportamiento Esperado | Estado | Prioridad |
| :--- | :--- | :---: | :---: |
| Latencia de red > 10s | Timeout detectado, Exit Code 2. | ⚠️ | Alta |
| Interrupción de conexión (Offline) | Error de red detectado, Exit Code 2. | ✅ | Alta |
| JSON mal formado del backend | `mapError` lo captura como error interno (Exit Code 2). | ✅ | Media |

## Análisis de Gaps Actuales
1.  **Llamadas al Backend (Convex)**: Varios casos borde dependen de la integración real con Convex (IDs inexistentes, duplicados, errores 404/401). Actualmente, los comandos tienen placeholders para estas llamadas.
2.  **Validación de Agente (Exit Code 4)**: La verificación de que un agente existe en la DB antes de enviar latidos o estados no está implementada localmente, dependerá del backend.
3.  **Sanitización de Filtros**: Asegurar que las queries a Convex manejen caracteres especiales de forma segura.

## Recomendaciones Actualizadas
- **Tests de Normalización**: La normalización de `task progress` ya tiene tests exhaustivos (`tests/normalize.test.ts`). Se recomienda extender este enfoque a otras validaciones locales.
- **Validación de URL/SHA**: Implementada y testeada en `task complete`.
- **Placeholder a Real**: Migrar los `TODO` en los comandos para usar `getConvexClient()` y envolverlos en `withTimeout`.
