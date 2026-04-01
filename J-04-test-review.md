# J-04: Revisión de la Suite de Tests y Huecos de Cobertura (Actualizado)

Esta revisión analiza la suite de tests actual frente a los requisitos del contrato y los casos borde identificados.

## Estado de la Suite de Tests

| Área | Cobertura | Observaciones |
| :--- | :---: | :--- |
| **Librería de Salida (`output.ts`)** | ✅ | Cubre `stdout`, `stderr` y formato base. |
| **Exit Codes (`exitcodes.ts`)** | ✅ | Verifica las constantes de los códigos de salida. |
| **Mapeo de Errores (`errors.ts`)** | ✅ | Verifica el mapeo de red, validación y agente a exit codes. |
| **Normalización de Progreso** | ✅ | Tests exhaustivos para colapsar espacios, saltos de línea y truncado (`tests/normalize.test.ts`). |
| **Comandos de Tarea (`task`)** | ✅ | `tests/commands-contract.test.ts` cubre el esquema del JSON devuelto por todos los comandos de tarea, incluyendo validaciones locales (`complete`, `create`, `comment`). |
| **Comandos de Agente (`agent`)** | ✅ | Tests de contrato completos para `register`, `heartbeat`, y `status` en `tests/commands-contract.test.ts` (28 tests). |
| **Validación de Entorno** | ✅ | Verifica la detección de variables faltantes (`CONVEX_URL`, `AGENT_ID`) en `tests/convex.test.ts`. |
| **Sync Types Script** | ✅ | Verifica que el script falle si la fuente no existe (`tests/sync-types.test.ts`). |

## Huecos de Test Detectados (Gaps)

1.  **Tests de Integración de Agente**:
    - Faltan tests para los comandos `agent register`, `agent heartbeat` y `agent status`. Actualmente devuelven placeholders JSON en `src/index.ts`.
2.  **Mocks de ConvexClient**:
    - Se necesitan mocks reales para `ConvexClient` una vez se activen las llamadas a la API en los comandos. Actualmente, los tests evitan llamar al cliente o lo mockean superficialmente.
3.  **Separación Estricta stdout/stderr en Ejecución**:
    - Falta un test de "caja negra" que ejecute el binario compilado y verifique que ante un error nada sale por `stdout`.
4.  **Verificación de Exit Codes Reales**:
    - Aunque hay tests unitarios para los códigos de salida, falta verificar que el proceso de Node.js termine con el código correcto al fallar.

## Sugerencias de Mejora

1.  **Añadir Tests de Contrato de Agente**: Crear un bloque describe en `tests/commands-contract.test.ts` o un nuevo archivo para validar el output de los comandos del agente.
2.  **Test de Smoke de Binario**: Crear un test que use `execa` para ejecutar `node dist/index.js` y verificar el árbol de ayuda y los códigos de salida básicos.
3.  **Mocking Global de Convex**: Implementar un mock de `ConvexClient` que permita simular demoras (>10s) para probar `withTimeout`.

## Conclusión
La cobertura ha mejorado significativamente con la inclusión de tests de contrato para todos los comandos de tarea (`J-04-test-review.md` previo). Sin embargo, el área del Agente sigue siendo la más débil en términos de pruebas automáticas.
