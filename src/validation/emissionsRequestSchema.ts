import { z } from "zod";
import { VehicleType } from "../types/emissions.types";

/**
 * Valida la ESTRUCTURA del payload HTTP (presencia de campos, tipos, enum).
 * Las reglas de NEGOCIO (rangos, positividad) se validan por separado en
 * el dominio (emissionsCalculator), que no depende de esta librería.
 * No se usa coerción automática: un string numérico debe ser rechazado
 * explícitamente en vez de convertirse silenciosamente.
 */
export const calculateEmissionsRequestSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType, {
    errorMap: () => ({ message: "vehicleType debe ser ELECTRIC, DIESEL o HYBRID." }),
  }),
  cargoWeightTonnes: z.number({
    invalid_type_error: "cargoWeightTonnes debe ser un número.",
    required_error: "cargoWeightTonnes es requerido.",
  }),
  distanceKm: z.number({
    invalid_type_error: "distanceKm debe ser un número.",
    required_error: "distanceKm es requerido.",
  }),
  efficiencyFactor: z.number({
    invalid_type_error: "efficiencyFactor debe ser un número.",
    required_error: "efficiencyFactor es requerido.",
  }),
});

export type CalculateEmissionsRequestInput = z.infer<typeof calculateEmissionsRequestSchema>;
