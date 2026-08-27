export enum VehicleType {
  ELECTRIC = "ELECTRIC",
  DIESEL = "DIESEL",
  HYBRID = "HYBRID",
}

export interface CalculateEmissionsRequestDTO {
  vehicleType: VehicleType;
  cargoWeightTonnes: number;
  distanceKm: number;
  efficiencyFactor: number;
}

export interface CalculateEmissionsResponseDTO {
  emissionsKgCO2: number;
  vehicleType: VehicleType;
  cargoWeightTonnes: number;
  distanceKm: number;
  efficiencyFactor: number;
  baseEmissionFactorUsed: number;
  calculatedAt: string;
}

export interface ApiErrorResponseDTO {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown[];
}
