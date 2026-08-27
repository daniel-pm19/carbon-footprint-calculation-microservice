# Carbon Tracker Service — EcoLogistics

Microservicio de cálculo de huella de carbono para **EcoLogistics**, desarrollado
como ejercicio de **ingeniería de prompts aplicada al desarrollo de software**:
el código no fue pedido con una instrucción simple, sino construido mediante una
secuencia de prompts con técnicas avanzadas (Persona, Chain-of-Thought,
Refinamiento Iterativo, Code Review crítico) que se documentan íntegramente en
este mismo archivo.

Este documento es el **entregable único** del ejercicio y contiene, en orden,
los cuatro artefactos pedidos: bitácora de prompts, código fuente, suite de
pruebas y reflexión crítica.

## Índice

1. [Autoevaluación según la rúbrica](#1-autoevaluación-según-la-rúbrica)
2. [Escenario y requisitos funcionales](#2-escenario-y-requisitos-funcionales)
3. [Stack y puesta en marcha](#3-stack-y-puesta-en-marcha)
4. [Entregable 1 — Bitácora de Prompts](#4-entregable-1--bitácora-de-prompts)
5. [Entregable 2 — Código Fuente](#5-entregable-2--código-fuente)
6. [Entregable 3 — Suite de Pruebas](#6-entregable-3--suite-de-pruebas)
7. [Entregable 4 — Reflexión Crítica](#7-entregable-4--reflexión-crítica)
8. [Documentación de la API](#8-documentación-de-la-api)

---

## 1. Autoevaluación según la rúbrica

| Criterio | Evidencia | Dónde verificarlo |
|---|---|---|
| **Ingeniería de Prompts Estratégica** — uso avanzado de Persona, Chain-of-Thought, refinamiento iterativo; guía estructurada, no instrucciones simples. | 7 prompts documentados con su respuesta clave, mostrando la evolución del código de una v1 ingenua a una v2 refinada tras revisión crítica. | [Sección 4](#4-entregable-1--bitácora-de-prompts) |
| **Calidad Técnica del Microservicio** — modular, SOLID, manejo de errores robusto, lógica de cálculo precisa y legible. | Dominio (`src/domain`) sin dependencias de Express/Zod (SRP/DIP), errores tipados, dos capas de validación, fórmula documentada con sus asunciones. | [Sección 5](#5-entregable-2--código-fuente) |
| **Estrategia de Validación** — cobertura ≥90% con escenarios de error; refinamiento post-revisión evidenciado. | 33 tests, **100%** de cobertura en `domain`/`validation`/`controllers` (umbral configurado en 90%); code review que generó correcciones concretas aplicadas al código. | [Sección 6](#6-entregable-3--suite-de-pruebas) y [Sección 4.7](#47-prompt-de-code-review-crítico-sesión-nueva-sin-contexto-previo) |

Verificación reproducible:

```bash
npm install && npm run typecheck && npm run lint && npm test && npm run build
```

---

## 2. Escenario y requisitos funcionales

EcoLogistics necesita calcular las emisiones de CO2 de sus envíos a partir de:

- **Tipo de vehículo**: Eléctrico, Diésel o Híbrido.
- **Peso de la carga** (toneladas).
- **Distancia recorrida** (kilómetros).
- **Factor de eficiencia** del combustible/energía.

El resultado debe exponerse vía una API REST, con la lógica de negocio separada
de los controladores HTTP, manejo de errores robusto y una suite de pruebas que
cubra los casos de borde (distancia cero, carga negativa, tipos de vehículo no
soportados, factores de eficiencia inválidos).

---

## 3. Stack y puesta en marcha

**Stack:** Node.js + TypeScript, Express, Zod (validación), Jest + Supertest (pruebas).

```bash
npm install
npm run typecheck    # tsc --noEmit
npm run lint          # ESLint
npm test               # Jest (unit + integración), con reporte de cobertura
npm run build           # compila a dist/
npm run dev              # servidor en modo desarrollo (recarga en caliente)
npm start                 # requiere `npm run build` previo
```

Variables de entorno (ver [`.env.example`](.env.example)): `PORT` (por defecto `3000`).

---

## 4. Entregable 1 — Bitácora de Prompts

Registro de los prompts principales usados durante el desarrollo y las
respuestas clave del LLM (Claude, Sonnet 5), mostrando la **evolución** del
código: de una primera versión ingenua a una versión refinada tras validación
de datos y revisión crítica.

### 4.1 Prompt de rol y contexto (Persona)

> Actúas como un **Desarrollador Senior** experto en Node.js, TypeScript y
> arquitectura de microservicios. Sigues principios de **Clean Code** y **SOLID**
> (en particular SRP y DIP: la lógica de negocio no debe depender de frameworks
> HTTP). El código debe ser modular, tipado estrictamente, con manejo de errores
> explícito y testeable de forma aislada.
>
> Vas a construir el "Carbon Tracker Service" para EcoLogistics: un microservicio
> que calcula emisiones de CO2 en base a tipo de vehículo (Eléctrico, Diésel,
> Híbrido), peso de la carga (toneladas), distancia (km) y un factor de eficiencia.
> Antes de escribir código, propón la arquitectura de carpetas separando
> claramente el dominio de cálculo de los controladores de la API.

**Respuesta clave (resumen):** se propuso separar el proyecto en capas —
`domain` (cálculo puro, sin dependencias de Express), `validation` (esquema
estructural con Zod), `controllers`/`routes` (capa HTTP) y `errors`
(errores tipados) — de modo que la lógica de negocio se pueda probar sin
levantar un servidor y sin acoplarse a la librería de validación HTTP.

### 4.2 Prompt de Chain-of-Thought: razonar antes de codificar

> Antes de escribir ninguna línea de código, razona paso a paso:
> 1. ¿Qué variables y unidades intervienen en el cálculo?
> 2. ¿Existe alguna convención estándar de la industria del transporte que se
>    pueda adaptar (en vez de inventar una fórmula desde cero)?
> 3. ¿Qué factor de emisión base es razonable para Eléctrico, Diésel e Híbrido,
>    y por qué?
> 4. ¿Cómo debería modular el resultado el "factor de eficiencia"?
> 5. ¿Qué casos límite existen en estas variables?
>
> No escribas código todavía. Entrega solo el razonamiento y la fórmula final.

**Razonamiento obtenido:**
1. Variables: `distanceKm`, `cargoWeightTonnes`, `vehicleType`, `efficiencyFactor`.
2. Se identificó la convención **tonelada-kilómetro (t·km)**, usada en marcos
   como el *GLEC Framework* / ISO 14083, donde las emisiones se atribuyen
   proporcionalmente a la carga y la distancia: `kg CO2 / t·km`.
3. **Primer intento (ingenuo):** se propuso `DIESEL = 0.115`, `HYBRID = 0.07` y
   **`ELECTRIC = 0`**, razonando que "un eléctrico no emite en el escape".
   *(Este supuesto se marca deliberadamente como el punto de partida ingenuo:
   se corrige en el apartado 4.7, tras el code review.)*
4. El `efficiencyFactor` se modeló como un multiplicador normalizado alrededor
   de `1.0`: valores `< 1` mejoran la eficiencia (reducen emisiones), valores
   `> 1` la empeoran (ej. mantenimiento deficiente, sobrecarga).
5. Casos límite identificados: distancia o carga negativa/cero, tipo de
   vehículo no soportado, `efficiencyFactor` no numérico o extremo.

**Fórmula propuesta:**
```
emissionsKgCO2 = distanceKm × cargoWeightTonnes × baseEmissionFactor[vehicleType] × efficiencyFactor
```

### 4.3 Prompt de primera implementación (versión ingenua)

> Implementa la función `calculateEmissions` en TypeScript aplicando la fórmula
> anterior.

**v1 (fragmento, simplificada a propósito para ilustrar sus carencias):**
```ts
function calculateEmissions(vehicleType: string, weight: number, distance: number, efficiency: number) {
  const factors = { DIESEL: 0.115, HYBRID: 0.07, ELECTRIC: 0 };
  const factor = factors[vehicleType]; // undefined si el tipo no existe
  return distance * weight * factor * efficiency; // NaN si factor es undefined
}
```

**Carencias detectadas de inmediato:** no valida `distance`/`weight` negativos
o cero, no valida `efficiency` (`NaN`/`Infinity` producen un resultado
silenciosamente inválido en vez de un error), y un `vehicleType` desconocido
da como resultado `NaN` en lugar de un error explícito.

### 4.4 Prompt de refinamiento iterativo (validación y errores)

> Esta versión falla silenciosamente ante entradas inválidas (devuelve `NaN`
> en vez de lanzar un error). Refactoriza para que:
> - Cada regla de negocio violada lance un error **tipado**, no un `Error`
>   genérico.
> - Se puedan distinguir los casos por un código de error, para que la capa
>   HTTP los mapee al status code correcto.
> - Se rechacen explícitamente `NaN`, `Infinity` y valores fuera de rangos de
>   sanidad (no solo negativos).

**v2 (resultado, resumen del enfoque):** se introdujo `AppError` (clase base)
y `ValidationError` con un `code` de la unión `ErrorCodes`
(`INVALID_DISTANCE`, `INVALID_CARGO_WEIGHT`, `UNSUPPORTED_VEHICLE_TYPE`,
`INVALID_EFFICIENCY_FACTOR`). Cada regla usa `Number.isFinite(...)` en vez de
solo comparar signos, y se agregaron límites superiores de sanidad
(`MAX_DISTANCE_KM`, `MAX_CARGO_WEIGHT_TONNES`, `MAX_EFFICIENCY_FACTOR`) para
detectar errores de entrada evidentes. El resultado final está en
[`src/domain/emissionsCalculator.ts`](#51-código-del-dominio-cálculo-puro).

### 4.5 Prompt de modularización

> Separa la lógica de negocio de los controladores de la API. El módulo de
> dominio no debe importar nada de Express ni de la librería de validación
> HTTP, para poder testearlo de forma aislada y reutilizarlo fuera de un
> contexto HTTP. Propón la estructura de carpetas resultante.

**Respuesta clave:** confirmó y afinó la estructura ya esbozada en 4.1,
añadiendo la separación entre validación **estructural** (Zod, en
`validation/`, qué forma tiene el payload) y validación de **reglas de
negocio** (en `domain/`, qué valores son válidos) como dos responsabilidades
distintas (SRP) — el dominio no depende de Zod ni de Express (DIP), lo que
permite invocar `calculateEmissions` directamente en pruebas unitarias sin
levantar un servidor HTTP. Ver la estructura resultante en la
[Sección 5](#5-entregable-2--código-fuente).

### 4.6 Prompt de generación de la suite de pruebas

> Genera una suite de pruebas con Jest para `calculateEmissions` y el esquema
> de validación, cubriendo explícitamente: distancia cero, distancia negativa,
> carga negativa, tipo de vehículo no soportado, factor de eficiencia
> inválido (cero, negativo, `NaN`, `Infinity`, fuera de rango), valores límite
> (boundary) y el camino feliz para cada tipo de vehículo. Apunta a cobertura
> alta en la capa de dominio y validación.

**Resultado:** 33 pruebas en tres archivos con **100% de cobertura** de
statements/branches/functions/lines en `src/domain`, `src/validation` y
`src/controllers` (umbral configurado en 90%, superado). Ver
[Sección 6](#6-entregable-3--suite-de-pruebas).

### 4.7 Prompt de code review crítico (sesión nueva, sin contexto previo)

> Actúas como revisor de código senior, en una **sesión nueva**, sin contexto
> del desarrollo previo. Audita este código (dominio, controlador, app) buscando:
> 1. Vulnerabilidades de seguridad (DoS por payloads/valores extremos, fuga de
>    información en mensajes de error).
> 2. Problemas de rendimiento.
> 3. Errores sutiles de dominio — por ejemplo, ¿es razonable asumir 0
>    emisiones para vehículos eléctricos? ¿Qué pasa con valores extremadamente
>    grandes o `Infinity`?
>
> Lista los hallazgos priorizados por severidad y propone parches concretos.

**Hallazgos y correcciones aplicadas:**

| # | Hallazgo | Severidad | Corrección aplicada |
|---|---|---|---|
| 1 | Asumir `ELECTRIC = 0` ignora la huella *well-to-wheel* de la electricidad consumida; es un supuesto científicamente indefendible que subestima emisiones reales. | Alta (dominio) | Se cambió a `ELECTRIC = 0.02` kg CO2/t·km, documentado como aproximación de una matriz eléctrica moderadamente limpia, con nota de que en producción debería parametrizarse por región. |
| 2 | `express.json()` sin límite de tamaño permite payloads arbitrariamente grandes → vector de DoS. | Alta (seguridad) | Se agregó `express.json({ limit: "10kb" })` en `app.ts`. |
| 3 | Sin límites superiores de sanidad en `distanceKm`/`cargoWeightTonnes`/`efficiencyFactor`, valores absurdos (ej. `1e15`) producen resultados sin sentido sin error. | Media (dominio) | Se agregaron `MAX_DISTANCE_KM`, `MAX_CARGO_WEIGHT_TONNES`, `MAX_EFFICIENCY_FACTOR` con validación explícita. |
| 4 | JSON malformado en el body caía en el manejador genérico de errores (500), exponiendo un caso de entrada de usuario como error interno. | Media (seguridad/UX) | El `errorHandler` detecta `SyntaxError` de `body-parser` y responde `400 VALIDATION_ERROR` en vez de `500`. |
| 5 | Riesgo de que un error inesperado filtre su `stack` o mensaje interno al cliente. | Media (seguridad) | El `errorHandler` solo serializa `statusCode`/`code`/`message` públicos; el error real se loguea server-side y nunca se expone en la respuesta. |
| 6 | Cálculo es síncrono y sin I/O — sin problemas de rendimiento relevantes, pero riesgo de validación redundante entre Zod y el dominio. | Baja | Se mantuvieron ambas capas deliberadamente (defensa en profundidad: el dominio no debe confiar en que solo se invoque vía HTTP), documentando la razón en el propio código. |

---

## 5. Entregable 2 — Código Fuente

### Arquitectura

```
src/
  domain/          # cálculo puro + reglas de negocio (sin dependencias de Express/Zod)
  validation/       # esquema Zod: validación estructural del payload HTTP
  controllers/      # handlers Express: orquestan validación + dominio
  routes/           # definición de endpoints
  errors/           # AppError, ValidationError, catálogo de códigos de error
  middlewares/      # errorHandler (uniforme, sin fugas), notFoundHandler
  types/            # DTOs y enum VehicleType
  utils/            # logger
tests/
  unit/             # dominio y validación en aislamiento
  integration/       # rutas HTTP end-to-end (supertest)
```

Manejo de errores en **dos capas**: Zod valida la *estructura* del payload
(tipos, presencia de campos, enum) → `400 VALIDATION_ERROR`; el dominio valida
las *reglas de negocio* de forma autocontenida (rangos, positividad) →
`ValidationError` con código específico (`INVALID_DISTANCE`,
`INVALID_CARGO_WEIGHT`, `UNSUPPORTED_VEHICLE_TYPE`, `INVALID_EFFICIENCY_FACTOR`).

### 5.1 Código del dominio (cálculo puro)

[`src/domain/emissionFactors.ts`](src/domain/emissionFactors.ts) — factores base y límites de sanidad:

```ts
import { VehicleType } from "../types/emissions.types";

/**
 * Factores base de emisión en kg CO2 por tonelada-kilómetro (kg CO2/t·km),
 * la unidad estándar en marcos de contabilidad de carbono logística
 * (ej. GLEC Framework / ISO 14083).
 *
 * ELECTRIC no es 0: un vehículo eléctrico no emite en el escape, pero su huella
 * real depende de la generación de la electricidad consumida (well-to-wheel).
 * Se usa un valor bajo que aproxima una matriz eléctrica moderadamente limpia;
 * en un sistema real este factor debería parametrizarse según la intensidad de
 * carbono de la red eléctrica de la región.
 */
export const BASE_EMISSION_FACTORS: Record<VehicleType, number> = {
  [VehicleType.DIESEL]: 0.115,
  [VehicleType.HYBRID]: 0.07,
  [VehicleType.ELECTRIC]: 0.02,
};

/**
 * Límites de sanidad de entrada: no son límites físicos exactos, sino
 * heurísticas para detectar datos claramente erróneos (ej. errores de dedo).
 */
export const INPUT_LIMITS = {
  MAX_DISTANCE_KM: 20_000,
  MAX_CARGO_WEIGHT_TONNES: 200,
  MAX_EFFICIENCY_FACTOR: 5,
} as const;

export function isSupportedVehicleType(value: string): value is VehicleType {
  return Object.values(VehicleType).includes(value as VehicleType);
}
```

[`src/domain/emissionsCalculator.ts`](src/domain/emissionsCalculator.ts) — función pura de cálculo + validación de reglas de negocio:

```ts
import { ValidationError } from "../errors/ValidationError";
import { ErrorCodes } from "../errors/errorCodes";
import type { CalculateEmissionsRequestDTO, CalculateEmissionsResponseDTO } from "../types/emissions.types";
import { BASE_EMISSION_FACTORS, INPUT_LIMITS, isSupportedVehicleType } from "./emissionFactors";

function assertValidDistance(distanceKm: number): void {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new ValidationError(
      ErrorCodes.INVALID_DISTANCE,
      "distanceKm debe ser un número finito mayor que 0.",
    );
  }
  if (distanceKm > INPUT_LIMITS.MAX_DISTANCE_KM) {
    throw new ValidationError(
      ErrorCodes.INVALID_DISTANCE,
      `distanceKm no puede superar ${INPUT_LIMITS.MAX_DISTANCE_KM} km.`,
    );
  }
}

function assertValidCargoWeight(cargoWeightTonnes: number): void {
  if (!Number.isFinite(cargoWeightTonnes) || cargoWeightTonnes < 0) {
    throw new ValidationError(
      ErrorCodes.INVALID_CARGO_WEIGHT,
      "cargoWeightTonnes debe ser un número finito mayor o igual que 0.",
    );
  }
  if (cargoWeightTonnes > INPUT_LIMITS.MAX_CARGO_WEIGHT_TONNES) {
    throw new ValidationError(
      ErrorCodes.INVALID_CARGO_WEIGHT,
      `cargoWeightTonnes no puede superar ${INPUT_LIMITS.MAX_CARGO_WEIGHT_TONNES} toneladas.`,
    );
  }
}

function assertValidEfficiencyFactor(efficiencyFactor: number): void {
  if (!Number.isFinite(efficiencyFactor) || efficiencyFactor <= 0) {
    throw new ValidationError(
      ErrorCodes.INVALID_EFFICIENCY_FACTOR,
      "efficiencyFactor debe ser un número finito mayor que 0.",
    );
  }
  if (efficiencyFactor > INPUT_LIMITS.MAX_EFFICIENCY_FACTOR) {
    throw new ValidationError(
      ErrorCodes.INVALID_EFFICIENCY_FACTOR,
      `efficiencyFactor no puede superar ${INPUT_LIMITS.MAX_EFFICIENCY_FACTOR}.`,
    );
  }
}

function assertSupportedVehicleType(vehicleType: string): void {
  if (!isSupportedVehicleType(vehicleType)) {
    throw new ValidationError(
      ErrorCodes.UNSUPPORTED_VEHICLE_TYPE,
      `vehicleType "${vehicleType}" no es un tipo de vehículo soportado.`,
    );
  }
}

/**
 * Calcula las emisiones de CO2 atribuibles a la carga transportada (no las
 * emisiones totales del vehículo). Por eso cargoWeightTonnes = 0 es una
 * entrada válida que produce 0 kg CO2 (ej. tramo de retorno en vacío).
 *
 * Fórmula: emissionsKgCO2 = distanceKm × cargoWeightTonnes × baseFactor × efficiencyFactor
 *
 * Esta función es pura y no depende de Express/Zod: valida sus propias reglas
 * de negocio para poder usarse de forma aislada y ser reutilizable/testeable.
 */
export function calculateEmissions(
  request: CalculateEmissionsRequestDTO,
): CalculateEmissionsResponseDTO {
  assertSupportedVehicleType(request.vehicleType);
  assertValidDistance(request.distanceKm);
  assertValidCargoWeight(request.cargoWeightTonnes);
  assertValidEfficiencyFactor(request.efficiencyFactor);

  const baseEmissionFactorUsed = BASE_EMISSION_FACTORS[request.vehicleType];
  const emissionsKgCO2 =
    request.distanceKm * request.cargoWeightTonnes * baseEmissionFactorUsed * request.efficiencyFactor;

  return {
    emissionsKgCO2,
    vehicleType: request.vehicleType,
    cargoWeightTonnes: request.cargoWeightTonnes,
    distanceKm: request.distanceKm,
    efficiencyFactor: request.efficiencyFactor,
    baseEmissionFactorUsed,
    calculatedAt: new Date().toISOString(),
  };
}
```

### 5.2 Capa HTTP (rutas y controlador)

[`src/controllers/emissionsController.ts`](src/controllers/emissionsController.ts):

```ts
import type { NextFunction, Request, Response } from "express";
import { calculateEmissions } from "../domain/emissionsCalculator";
import { calculateEmissionsRequestSchema } from "../validation/emissionsRequestSchema";

export function handleCalculateEmissions(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsedRequest = calculateEmissionsRequestSchema.parse(req.body);
    const result = calculateEmissions(parsedRequest);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
```

[`src/routes/emissionsRoutes.ts`](src/routes/emissionsRoutes.ts):

```ts
import { Router } from "express";
import { handleCalculateEmissions } from "../controllers/emissionsController";

export const emissionsRouter = Router();

emissionsRouter.post("/emissions/calculate", handleCalculateEmissions);
```

El resto del código (tipos, errores, middlewares, `app.ts`, `server.ts`) está
en [`src/`](src/) y sigue el mismo patrón: cada archivo tiene una única
responsabilidad, sin lógica de negocio fuera de `domain/`.

---

## 6. Entregable 3 — Suite de Pruebas

```
Test Suites: 3 passed, 3 total
Tests:       33 passed, 33 total

----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |     100 |      100 |     100 |     100 |
 controllers                |     100 |      100 |     100 |     100 |
  emissionsController.ts    |     100 |      100 |     100 |     100 |
 domain                     |     100 |      100 |     100 |     100 |
  emissionFactors.ts        |     100 |      100 |     100 |     100 |
  emissionsCalculator.ts    |     100 |      100 |     100 |     100 |
 validation                 |     100 |      100 |     100 |     100 |
  emissionsRequestSchema.ts |     100 |      100 |     100 |     100 |
----------------------------|---------|----------|---------|---------|
```

### 6.1 `tests/unit/domain/emissionsCalculator.test.ts` (20 casos)

Camino feliz por cada tipo de vehículo (DIESEL, ELECTRIC, HYBRID) · el
`efficiencyFactor` reduce/aumenta las emisiones proporcionalmente ·
`cargoWeightTonnes = 0` devuelve 0 (viaje en vacío) · `distanceKm` cero o
negativa lanza error · `cargoWeightTonnes` negativa lanza error ·
`vehicleType` no soportado lanza error · `efficiencyFactor` cero, negativo,
`NaN` o `Infinity` lanza error · valores en el límite superior de sanidad se
aceptan (boundary) y por encima del límite se rechazan (distancia, carga y
eficiencia) · valores extremos dentro de los límites no producen `NaN`/overflow
· el cálculo es determinista.

### 6.2 `tests/unit/validation/emissionsRequestSchema.test.ts` (5 casos)

Acepta un payload válido completo · rechaza payload sin `vehicleType` ·
rechaza `distanceKm` como string · rechaza un payload que no es un objeto
(array) · rechaza `vehicleType` fuera del enum soportado.

### 6.3 `tests/integration/emissionsRoutes.test.ts` (8 casos)

`POST /api/v1/emissions/calculate` devuelve 200 y el cálculo correcto ·
devuelve 400 `VALIDATION_ERROR` ante un campo faltante · devuelve 400
`INVALID_DISTANCE` ante distancia negativa · devuelve 400 `VALIDATION_ERROR`
ante un tipo de vehículo no soportado (rechazado por Zod antes de llegar al
dominio) · la respuesta de error nunca expone stack trace ni detalles
internos · `GET /health` responde 200 · una ruta inexistente devuelve 404
`NOT_FOUND`.

Archivos completos: [`tests/unit/domain/emissionsCalculator.test.ts`](tests/unit/domain/emissionsCalculator.test.ts),
[`tests/unit/validation/emissionsRequestSchema.test.ts`](tests/unit/validation/emissionsRequestSchema.test.ts),
[`tests/integration/emissionsRoutes.test.ts`](tests/integration/emissionsRoutes.test.ts).

---

## 7. Entregable 4 — Reflexión Crítica

Usar un LLM para construir este microservicio aceleró notablemente las partes
mecánicas del trabajo — boilerplate de Express, tipado TypeScript, estructura
de carpetas siguiendo SOLID, y una suite de pruebas con casos de borde
explícitos que habría sido tedioso enumerar a mano — permitiendo dedicar más
tiempo a decisiones de diseño que a escritura repetitiva. Sin embargo, este
mismo proyecto expone el riesgo central de delegar en un LLM la parte más
sensible del problema: la **lógica de dominio**. La primera propuesta de
fórmula asumió, de forma plausible pero incorrecta, que un vehículo eléctrico
emite 0 kg CO2 — una "alucinación" de dominio que un LLM puede presentar con
total confianza y que un revisor sin conocimiento del área (well-to-wheel vs.
tailpipe emissions) fácilmente aceptaría sin cuestionarla. Los tests unitarios
y el chequeo de tipos no habrían detectado este error, porque ambos verifican
que el código haga lo que el código dice, no que la fórmula sea correcta
científicamente. Esto evidencia que los LLMs son más confiables generando
código *mecánico* (validación, manejo de errores, estructura) que generando o
validando *conocimiento de dominio* (factores de emisión reales, supuestos
metodológicos), y que ese conocimiento requiere revisión humana experta antes
de usarse en cálculos con implicancias reales — como reportes de
sostenibilidad bajo marcos como el GHG Protocol, donde un error sutil y
silencioso podría propagarse a informes de cumplimiento con consecuencias
reputacionales o legales.

---

## 8. Documentación de la API

### `GET /health`

Smoke test del servidor.

```bash
curl http://localhost:3000/health
# { "status": "ok" }
```

### `POST /api/v1/emissions/calculate`

**Body:**

| Campo | Tipo | Descripción |
|---|---|---|
| `vehicleType` | `"ELECTRIC" \| "DIESEL" \| "HYBRID"` | Tipo de vehículo |
| `cargoWeightTonnes` | `number` | Peso de la carga en toneladas (`>= 0`) |
| `distanceKm` | `number` | Distancia recorrida en km (`> 0`) |
| `efficiencyFactor` | `number` | Multiplicador de eficiencia, `1.0` = referencia (`> 0`) |

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/v1/emissions/calculate \
  -H "Content-Type: application/json" \
  -d '{"vehicleType":"DIESEL","cargoWeightTonnes":10,"distanceKm":250,"efficiencyFactor":1.0}'
```

```json
{
  "emissionsKgCO2": 287.5,
  "vehicleType": "DIESEL",
  "cargoWeightTonnes": 10,
  "distanceKm": 250,
  "efficiencyFactor": 1,
  "baseEmissionFactorUsed": 0.115,
  "calculatedAt": "2026-08-26T20:00:00.000Z"
}
```

**Errores** (`400`), con forma uniforme `{ statusCode, code, message, details? }`:

| `code` | Causa |
|---|---|
| `VALIDATION_ERROR` | Payload malformado, campo faltante, tipo incorrecto o `vehicleType` fuera del enum |
| `INVALID_DISTANCE` | `distanceKm` `<= 0`, no finito, o supera el límite de sanidad |
| `INVALID_CARGO_WEIGHT` | `cargoWeightTonnes` `< 0`, no finito, o supera el límite de sanidad |
| `INVALID_EFFICIENCY_FACTOR` | `efficiencyFactor` `<= 0`, no finito, o supera el límite de sanidad |
