# Tareas por agente — Pomotask CLI

## Principios de reparto
El reparto está diseñado para minimizar conflictos de edición y permitir trabajo en paralelo.

Reglas:
- OpenHands implementa código y tests del repositorio
- Jules revisa, valida, documenta y prepara integración
- Ambos pueden colaborar en tareas de integración, pero con ownership explícito
- Cada tarea debe cerrar con criterio de aceptación verificable

## Validación de la propuesta original
La división propuesta por Copilot va en buena dirección, pero necesita dos ajustes:

1. **OpenHands no debe quedarse con todos los tests y Jules con pura documentación.**
   Jules sí puede generar edge cases y planes de prueba, pero los tests cercanos al código deben nacer con la implementación.

2. **Jules no debería ser dueño de tareas ambiguas como “validar todo” sin checklist concreta.**
   Conviene convertir eso en auditorías puntuales con criterios cerrados.

Conclusión:
- la idea base es útil
- había sesgo hacia separar “código” y “documentación” de forma demasiado rígida
- conviene repartir por capas, riesgos y handoffs

---

## OpenHands — ownership principal

### Bloque A. Bootstrap del repositorio
**OH-01 — Inicializar estructura base del CLI**
- Crear estructura de carpetas y archivos base
- Configurar `package.json`
- Configurar `tsconfig`
- Configurar `vitest.config.ts`
- Configurar entrypoint con Commander

Criterio de aceptación:
- `pnpm build` corre o queda listo con placeholders tipados
- estructura alineada con `convex-cli-contexto.md`

**OH-02 — Implementar constantes y utilidades base**
- `src/lib/exitcodes.ts`
- `src/lib/output.ts`
- `src/lib/errors.ts`

Criterio de aceptación:
- salida JSON/human centralizada
- mapeo de errores reusable
- tests unitarios básicos

**OH-03 — Implementar `src/lib/convex.ts`**
- Validación de `CONVEX_URL`
- Validación de `POMOTASK_AGENT_ID`
- Inicialización del `ConvexClient`
- Exit Code 4 si entorno inválido

Criterio de aceptación:
- tests del entorno faltante
- no usa `import.meta.env`
- no usa `ConvexReactClient`

### Bloque B. Tipos y sincronización
**OH-04 — Implementar `pnpm sync-types`**
- Crear script `scripts/sync-types.mjs`
- Verificar `../pomotask/convex/_generated`
- Copiar a `src/lib/convex/_generated`
- Fallar con error claro si no existe

Criterio de aceptación:
- script idempotente
- test o verificación automatizada mínima

### Bloque C. Comandos task
**OH-05 — Implementar `task list`**
**OH-06 — Implementar `task create`**
**OH-07 — Implementar `task claim`**
**OH-08 — Implementar `task progress`**
**OH-09 — Implementar `task complete`**
**OH-10 — Implementar `task fail`**
**OH-11 — Implementar `task comment`**

Criterio de aceptación por comando:
- parsing correcto con Commander
- llamada a Convex desacoplada
- JSON final correcto
- errores mapeados a exit codes
- tests del caso feliz y al menos un caso de error

Notas especiales:
- `task claim` debe devolver `null` + Exit Code 1 si no hay tarea
- `task progress` debe normalizar y truncar a 280 caracteres

### Bloque D. Comandos agent
**OH-12 — Implementar `agent register`**
**OH-13 — Implementar `agent heartbeat`**
**OH-14 — Implementar `agent status`**

Criterio de aceptación:
- mismos estándares de salida y exit codes
- tests por comando

### Bloque E. Integración técnica mínima
**OH-15 — Integrar todos los comandos en `src/index.ts`**

Criterio de aceptación:
- árbol de comandos funcional
- `--format` consistente donde aplique

**OH-16 — Suite mínima de tests de contrato**
- stdout vs stderr
- exit codes críticos
- `claim` sin tarea
- `progress` normalización y truncado

Criterio de aceptación:
- `pnpm test` cubre los contratos de mayor riesgo

---

## Jules — ownership principal

### Bloque J. Auditoría de contrato
**J-01 — Auditar que el contexto implementado coincida con `convex-cli-contexto.md`** [COMPLETADA]
Revisar:
- stack correcto
- repo separado
- variables obligatorias
- comandos esperados
- reglas de salida
- exit codes
- sync-types

Entregable:
- checklist de conformidad
- lista de gaps exactos

**J-02 — Auditar mapeo de errores y resiliencia**
Revisar:
- errores de red
- timeout > 10s
- validación
- agente inválido
- separación stdout/stderr

Entregable:
- matriz “error detectado → exit code esperado → evidencia”

### Bloque J. QA funcional y diseño de pruebas
**J-03 — Diseñar edge cases por comando**
Ejemplos:
- `task progress` con multilinea, unicode y mensaje largo
- `task claim` con `null`
- `task complete` sin args requeridos
- `agent status` con agente inexistente

Entregable:
- documento de casos borde priorizados

**J-04 — Revisar la suite de tests propuesta por OpenHands**
Revisar cobertura sobre:
- contratos
- formato de salida
- exit codes
- errores críticos

Entregable:
- lista de huecos de test
- sugerencias concretas

### Bloque J. Documentación operativa
**J-05 — Mantener `.jules/cli.md`**
- registrar decisiones no obvias
- registrar sorpresas del backend o del tooling
- no duplicar documentación básica

**J-06 — Redactar `README.md` orientado a agentes**
Debe incluir:
- propósito
- setup
- env vars
- sync-types
- comandos
- ejemplo de uso de agente
- explicación de exit codes

**J-07 — Redactar guía de integración para agentes externos**
Documento sugerido:
- `docs/integration-for-agents.md`

Debe incluir:
- ciclo claim/work/progress/complete/fail
- cómo interpretar exit codes
- qué reintentar y qué no

### Bloque J. Auditoría de restricciones
**J-08 — Verificar restricciones no negociables**
Checklist explícita:
- no `ConvexReactClient`
- no `import.meta.env`
- no `console.log` directo
- no `any`
- no lógica de Git
- no TUI/UI interactiva

Entregable:
- reporte corto de conformidad

---

## Tareas compartidas de integración

### Integración 1
**INT-01 — Smoke test del CLI completo**
Owner principal: OpenHands  
Apoyo: Jules

Validar:
- comandos registrados
- salida mínima estable
- errores básicos controlados

### Integración 2
**INT-02 — Validación cruzada del contrato CLI**
Owner principal: Jules  
Apoyo: OpenHands

Validar:
- contexto vs implementación real
- salida JSON correcta
- semántica de exit codes
- manejo de `stderr`

### Integración 3
**INT-03 — E2E contra deployment real o stub controlado**
Owner principal: OpenHands  
Apoyo: Jules

Validar:
- claim
- progress
- complete
- fail
- heartbeat

### Integración 4
**INT-04 — Release readiness**
Owner principal: Jules  
Apoyo: OpenHands

Checklist:
- `pnpm build`
- `pnpm test`
- docs mínimas
- `.env.example`
- `AGENT.md`
- `convex-cli-contexto.md`

---

## Orden recomendado de ejecución
1. OH-01, OH-02, OH-03
2. J-01 en paralelo
3. OH-04
4. OH-05 a OH-11
5. J-02, J-03, J-04 en paralelo
6. OH-12 a OH-16
7. J-05 a J-08
8. INT-01 a INT-04

---

## Dependencias entre tareas
- OH-02 depende de OH-01
- OH-03 depende de OH-01
- OH-04 puede iniciar tras OH-01
- OH-05 a OH-14 dependen de OH-02 y OH-03
- OH-15 depende de OH-05 a OH-14
- OH-16 depende de la mayoría de comandos implementados
- J-04 depende de que exista una suite de tests inicial
- INT-03 depende de que los comandos críticos existan
- INT-04 depende de todo lo anterior

---

## Recomendación final sobre sesgo OpenHands vs Jules
Sí había un pequeño sesgo en la respuesta de Copilot:
- asignó a OpenHands casi toda la producción real
- dejó a Jules en una zona más pasiva y menos verificable

La división que propongo arriba es más equilibrada porque:
- OpenHands sigue siendo el implementador principal
- Jules tiene ownership real sobre QA de contrato, documentación viva y auditoría técnica
- ambos tienen entregables concretos y verificables
