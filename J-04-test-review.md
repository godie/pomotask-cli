# J-04: Revisión de la Suite de Tests y Huecos de Cobertura (Actualizado)

Esta revisión analiza la suite de tests actual frente a los requisitos del contrato y los casos borde identificados.

## Estado de la Suite de Tests

| Área | Cobertura | Observaciones |
| :--- | :---: | :--- |
| **Librería de Salida (`output.ts`)** | ✅ | Cubre `stdout`, `stderr` y formato base. |
| **Exit Codes (`exitcodes.ts`)** | ✅ | Verifica las constantes de los códigos de salida. |
| **Mapeo de Errores (`errors.ts`)** | ✅ | Verifica el mapeo de red, validación y agente a exit codes. |
<<<<<<< HEAD
| **Normalización de Progreso** | ✅ | Tests exhaustivos para colapsar espacios, saltos de línea y truncado (`tests/normalize.test.ts`). |
| **Comandos de Tarea (`task`)** | ✅ | `tests/commands-contract.test.ts` cubre el esquema del JSON devuelto por todos los comandos de tarea, incluyendo validaciones locales (`complete`, `create`, `comment`). |
| **Comandos de Agente (`agent`)** | ✅ | Tests de contrato completos para `register`, `heartbeat`, y `status` en `tests/commands-contract.test.ts` (28 tests). |
| **Validación de Entorno** | ✅ | Verifica la detección de variables faltantes (`CONVEX_URL`, `AGENT_ID`) en `tests/convex.test.ts`. |
| **Sync Types Script** | ✅ | Verifica que el script falle si la fuente no existe (`tests/sync-types.test.ts`). |

## Huecos de Test Detectados (Gaps)

1.  **Mocks de ConvexClient**:
    - Se necesitan mocks reales para `ConvexClient` una vez se activen las llamadas a la API en los comandos.
2.  **Separación Estricta stdout/stderr en Ejecución**:
    - Falta un test de "caja negra" que ejecute el binario compilado y verifique que ante un error nada sale por `stdout`.
3.  **Verificación de Exit Codes Reales**:
    - Falta verificar que el proceso de Node.js termine con el código correcto al fallar usando `process.exit`.

## Conclusión
La cobertura de contrato es excelente. Los siguientes pasos deben enfocarse en asegurar que las integraciones reales mantengan estos contratos.
