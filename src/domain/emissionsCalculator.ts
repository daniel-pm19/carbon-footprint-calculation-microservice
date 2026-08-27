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
