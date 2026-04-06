# J-04: Revisión de la Suite de Tests y Huecos de Cobertura (Actualizado)

Esta revisión analiza la suite de tests actual frente a los requisitos del contrato y los casos borde identificados.

## Estado de la Suite de Tests

| Área | Cobertura | Observaciones |
| :--- | :---: | :--- |
| **Librería de Salida (`output.ts`)** | ✅ | Cubre `stdout`, `stderr` y formato base. |
| **Exit Codes (`exitcodes.ts`)** | ✅ | Verifica las constantes de los códigos de salida. |
| **Mapeo de Errores (`errors.ts`)** | ✅ | Verifica el mapeo de red, validación y agente a exit codes. |
| **Normalización de Progreso** | ✅ | Tests exhaustivos para colapsar espacios, saltos de línea y truncado. |
| **Comandos de Tarea (`task`)** | ✅ | `tests/commands-contract.test.ts` cubre el esquema del JSON devuelto y validaciones locales. |
| **Comandos de Agente (`agent`)** | ✅ | Tests de contrato añadidos para `register`, `heartbeat` y `status`. |
| **Validación de Entorno** | ✅ | Verifica la detección de variables faltantes en `tests/convex.test.ts`. |
| **Sync Types Script** | ✅ | Verifica que el script falle si la fuente no existe. |

## Huecos de Test Detectados (Gaps)

1.  **Mocks de ConvexClient**:
    - Se necesitan mocks reales para `ConvexClient` una vez se activen las llamadas a la API en los comandos.
2.  **Separación Estricta stdout/stderr en Ejecución**:
    - Falta un test de "caja negra" que ejecute el binario compilado y verifique que ante un error nada sale por `stdout`.
3.  **Verificación de Exit Codes Reales**:
    - Falta verificar que el proceso de Node.js termine con el código correcto al fallar usando `process.exit`.

## Conclusión
La cobertura de contrato es excelente. Los siguientes pasos deben enfocarse en asegurar que las integraciones reales mantengan estos contratos.
