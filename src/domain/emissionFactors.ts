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
