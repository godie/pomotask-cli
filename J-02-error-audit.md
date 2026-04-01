# J-02: Auditoría de Mapeo de Errores y Resiliencia

Esta auditoría revisa cómo el CLI gestiona fallos y los mapea a los Exit Codes definidos en el contrato.

## Matriz de Mapeo de Errores

| Escenario de Error | Exit Code Esperado | Estado de Implementación | Evidencia / Clase |
| :--- | :---: | :---: | :--- |
| Éxito total | 0 | ✅ | Comportamiento por defecto de Node.js / Commander. |
| `task claim` sin tareas | 1 | ✅ | `NoTasksAvailableError` en `src/lib/errors.ts`. |
| Timeout (> 10s) | 2 | ✅ | `mapError` detecta "timeout". |
| Error de red / DNS / Fetch | 2 | ✅ | `mapError` detecta "fetch", "network", "ECONNREFUSED", etc. |
| Error de validación de argumentos CLI | 3 | ✅ | `ValidationError` usado en comandos (`complete`, `fail`, etc.). |
| Error de validación de payload (Convex) | 3 | ⚠️ | Parcial. Depende de que Convex devuelva un error captable como validación. |
| `CONVEX_URL` faltante | 4 | ✅ | `validateEnvironment` en `src/lib/convex.ts`. |
| `POMOTASK_AGENT_ID` faltante | 4 | ✅ | `validateEnvironment` en `src/lib/convex.ts`. |
| Agente no encontrado / no autorizado | 4 | ⚠️ | Existe `InvalidAgentError`, pero su uso en respuestas del backend es placeholder. |

## Análisis de Resiliencia

1.  **Separación stdout/stderr**:
    - La lógica en `src/lib/output.ts` garantiza que el JSON final vaya a `stdout` y los errores a `stderr`.
    - `src/index.ts` usa `writeStderr` en el bloque catch global.
2.  **Timeouts**:
    - `src/lib/convex.ts` define `CONVEX_TIMEOUT_MS = 10000`.
    - Sin embargo, el `ConvexClient` nativo de Node no acepta un timeout simple por configuración global fácilmente. Se recomienda asegurar que las llamadas lo implementen o usar un wrapper.
3.  **Fuga de Stack Traces**:
    - `mapError` previene que se impriman trazas crudas a `stdout`. El mensaje de error se envía limpio a `stderr`.

## Recomendaciones
- Asegurar que cuando se implementen las llamadas reales a Convex, los errores de "unauthorized" (401/403) se mapeen explícitamente a Exit Code 4.
- Implementar un wrapper de timeout real para las promesas de Convex si el cliente no lo soporta de forma nativa.
