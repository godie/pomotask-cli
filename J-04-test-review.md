# J-04: Revisión de la Suite de Tests y Huecos de Cobertura

Esta revisión analiza la suite de tests actual frente a los requisitos del contrato y los casos borde identificados.

## Estado de la Suite de Tests

| Área | Cobertura | Observaciones |
| :--- | :---: | :--- |
| **Librería de Salida (`output.ts`)** | ✅ | Cubre `stdout`, `stderr` y formato base. |
| **Exit Codes (`exitcodes.ts`)** | ✅ | Verifica las constantes de los códigos de salida. |
| **Mapeo de Errores (`errors.ts`)** | ✅ | Verifica el mapeo de red, validación y agente a exit codes. |
| **Normalización de Progreso** | ✅ | Tests exhaustivos para colapsar espacios, saltos de línea y truncado. |
| **Comandos de Tarea (`task`)** | ⚠️ | Solo se testea el mapeo de errores, no el flujo completo del comando. |
| **Comandos de Agente (`agent`)** | ❌ | Sin tests específicos actualmente. |
| **Validación de Entorno** | ✅ | Verifica la detección de variables faltantes (`CONVEX_URL`, `AGENT_ID`). |
| **Sync Types Script** | ✅ | Verifica que el script falle si la fuente no existe. |

## Huecos de Test Detectados (Gaps)

1.  **Tests de Integración de Comandos**:
    - Falta verificar que los comandos en `src/index.ts` (Commander) llaman correctamente a las funciones de `src/commands/`.
    - No hay tests que verifiquen el output JSON real de cada comando exitoso.
2.  **Mocks de ConvexClient**:
    - Aunque hay tests que mencionan el cliente, no hay una infraestructura de mocking establecida para simular respuestas de la API de Convex (queries/mutations).
3.  **Separación Estricta stdout/stderr en Ejecución**:
    - Los tests actuales de `output.ts` son unitarios. Falta un test de "caja negra" que ejecute el CLI (o el entrypoint) y verifique que ante un error nada sale por `stdout`.
4.  **Casos Borde de J-03**:
    - Muchos de los casos borde definidos en J-03 (como IDs inexistentes o mensajes Unicode complejos) no tienen un test asociado todavía.
5.  **Formato Human**:
    - No hay tests que verifiquen que la opción `--format human` realmente cambie el comportamiento del output hacia algo distinto del JSON (actualmente es un placeholder).

## Sugerencias de Mejora

1.  **Añadir Tests de Contrato por Comando**: Crear `tests/commands-contract.test.ts` que verifique el esquema del JSON devuelto por cada comando.
2.  **Mocking de Convex**: Implementar un mock global de `ConvexClient` en `tests/setup.ts` (o similar) para facilitar el testeo de comandos sin red.
3.  **Test de Smoke**: Un test que ejecute `node dist/index.js --help` y verifique que el árbol de comandos es el esperado.
4.  **Verificación de Exit Codes Reales**: Usar `execa` o `child_process` para ejecutar el CLI en un entorno de test y capturar el exit code real del proceso.

## Conclusión
La cobertura unitaria de las librerías base es excelente. El riesgo principal reside en la capa de integración entre Commander y la lógica de negocio, y en la falta de simulación de interacciones con el backend de Convex.
