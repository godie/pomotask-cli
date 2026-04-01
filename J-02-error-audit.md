# J-02: Auditoría de Mapeo de Errores y Resiliencia (Actualizado)

Esta auditoría revisa cómo el CLI gestiona fallos y los mapea a los Exit Codes definidos en el contrato.

## Matriz de Mapeo de Errores

| Escenario de Error | Exit Code Esperado | Estado de Implementación | Evidencia / Clase |
| :--- | :---: | :---: | :--- |
| Éxito total | 0 | ✅ | Comportamiento por defecto de Node.js / Commander. |
| `task claim` sin tareas | 1 | ✅ | `NoTasksAvailableError` en `src/lib/errors.ts`. |
| Timeout (> 10s) | 2 | ✅ | `mapError` detecta "timeout". `withTimeout` definido en `src/lib/convex.ts`. |
| Error de red / DNS / Fetch | 2 | ✅ | `mapError` detecta "fetch", "network", "ECONNREFUSED", etc. |
| Error de validación de argumentos CLI | 3 | ✅ | `ValidationError` usado en comandos (`complete`, `fail`, etc.). |
| Error de validación de payload (Convex) | 3 | ⚠️ | Parcial. Depende de que Convex devuelva un error captable como validación. |
| `CONVEX_URL` faltante | 4 | ✅ | `validateEnvironment` en `src/lib/convex.ts`. |
| `POMOTASK_AGENT_ID` faltante | 4 | ✅ | `validateEnvironment` en `src/lib/convex.ts`. |
| Agente no encontrado / no autorizado | 4 | ⚠️ | Existe `InvalidAgentError`, pero su integración con respuestas 401/403 del backend está pendiente de implementación en las llamadas a Convex. |

## Análisis de Resiliencia

1.  **Separación stdout/stderr**:
    - ✅ **Verificado**: La lógica en `src/lib/output.ts` garantiza que el JSON final vaya a `stdout` y los errores a `stderr`.
    - ✅ **Verificado**: `src/index.ts` usa `writeStderr` en el bloque catch global para imprimir mensajes de error limpios.
2.  **Timeouts**:
    - ⚠️ **Parcial**: `src/lib/convex.ts` define `withTimeout` con un default de 10s.
    - 🔴 **Gap**: Actualmente, los comandos no están utilizando activamente `withTimeout` en sus implementaciones (pendientes de migrar a llamadas reales de Convex).
3.  **Fuga de Stack Traces**:
    - ✅ **Verificado**: `mapError` previene que se impriman trazas crudas a `stdout`. Solo se envía el mensaje descriptivo a `stderr`.

## Recomendaciones Actualizadas
- **Integrar `withTimeout`**: Una vez se implementen las llamadas reales a `ConvexClient`, envolverlas obligatoriamente con `withTimeout`.
- **Mapeo Explícito de 401/403**: Asegurar que los errores de autenticación provenientes de Convex se capturen y se lancen como `InvalidAgentError` para garantizar el Exit Code 4.
- **Validación Robusta de Payload**: Considerar el uso de esquemas de validación (como Zod) para las respuestas del backend antes de emitir el JSON final a `stdout`.
