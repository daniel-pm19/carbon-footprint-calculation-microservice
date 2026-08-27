import { calculateEmissions } from "../../../src/domain/emissionsCalculator";
import { ValidationError } from "../../../src/errors/ValidationError";
import { ErrorCodes } from "../../../src/errors/errorCodes";
import { VehicleType } from "../../../src/types/emissions.types";
import { INPUT_LIMITS } from "../../../src/domain/emissionFactors";

const baseRequest = {
  vehicleType: VehicleType.DIESEL,
  cargoWeightTonnes: 10,
  distanceKm: 250,
  efficiencyFactor: 1,
};

describe("calculateEmissions", () => {
  it("calcula correctamente las emisiones para DIESEL con valores típicos", () => {
    const result = calculateEmissions(baseRequest);
    expect(result.emissionsKgCO2).toBeCloseTo(250 * 10 * 0.115 * 1);
    expect(result.baseEmissionFactorUsed).toBe(0.115);
  });

  it("calcula correctamente las emisiones para ELECTRIC con valores típicos", () => {
    const result = calculateEmissions({ ...baseRequest, vehicleType: VehicleType.ELECTRIC });
    expect(result.emissionsKgCO2).toBeCloseTo(250 * 10 * 0.02 * 1);
    expect(result.baseEmissionFactorUsed).toBe(0.02);
  });

  it("calcula correctamente las emisiones para HYBRID con valores típicos", () => {
    const result = calculateEmissions({ ...baseRequest, vehicleType: VehicleType.HYBRID });
    expect(result.emissionsKgCO2).toBeCloseTo(250 * 10 * 0.07 * 1);
    expect(result.baseEmissionFactorUsed).toBe(0.07);
  });

  it("reduce las emisiones cuando efficiencyFactor < 1", () => {
    const baseline = calculateEmissions(baseRequest);
    const moreEfficient = calculateEmissions({ ...baseRequest, efficiencyFactor: 0.5 });
    expect(moreEfficient.emissionsKgCO2).toBeLessThan(baseline.emissionsKgCO2);
    expect(moreEfficient.emissionsKgCO2).toBeCloseTo(baseline.emissionsKgCO2 * 0.5);
  });

  it("aumenta las emisiones cuando efficiencyFactor > 1", () => {
    const baseline = calculateEmissions(baseRequest);
    const lessEfficient = calculateEmissions({ ...baseRequest, efficiencyFactor: 2 });
    expect(lessEfficient.emissionsKgCO2).toBeGreaterThan(baseline.emissionsKgCO2);
    expect(lessEfficient.emissionsKgCO2).toBeCloseTo(baseline.emissionsKgCO2 * 2);
  });

  it("devuelve 0 cuando cargoWeightTonnes = 0 (viaje en vacío)", () => {
    const result = calculateEmissions({ ...baseRequest, cargoWeightTonnes: 0 });
    expect(result.emissionsKgCO2).toBe(0);
  });

  it("lanza ValidationError cuando distanceKm = 0", () => {
    expect(() => calculateEmissions({ ...baseRequest, distanceKm: 0 })).toThrow(ValidationError);
    try {
      calculateEmissions({ ...baseRequest, distanceKm: 0 });
    } catch (error) {
      expect((error as ValidationError).code).toBe(ErrorCodes.INVALID_DISTANCE);
    }
  });

  it("lanza ValidationError cuando distanceKm es negativa", () => {
    expect(() => calculateEmissions({ ...baseRequest, distanceKm: -5 })).toThrow(ValidationError);
  });

  it("lanza ValidationError cuando cargoWeightTonnes es negativa", () => {
    expect(() => calculateEmissions({ ...baseRequest, cargoWeightTonnes: -1 })).toThrow(
      ValidationError,
    );
  });

  it("lanza ValidationError cuando vehicleType no es soportado", () => {
    expect(() =>
      calculateEmissions({ ...baseRequest, vehicleType: "GASOLINE" as VehicleType }),
    ).toThrow(ValidationError);
    try {
      calculateEmissions({ ...baseRequest, vehicleType: "GASOLINE" as VehicleType });
    } catch (error) {
      expect((error as ValidationError).code).toBe(ErrorCodes.UNSUPPORTED_VEHICLE_TYPE);
    }
  });

  it("lanza ValidationError cuando efficiencyFactor = 0", () => {
    expect(() => calculateEmissions({ ...baseRequest, efficiencyFactor: 0 })).toThrow(
      ValidationError,
    );
  });

  it("lanza ValidationError cuando efficiencyFactor es negativo", () => {
    expect(() => calculateEmissions({ ...baseRequest, efficiencyFactor: -1 })).toThrow(
      ValidationError,
    );
  });

  it("lanza ValidationError cuando efficiencyFactor es NaN", () => {
    expect(() => calculateEmissions({ ...baseRequest, efficiencyFactor: NaN })).toThrow(
      ValidationError,
    );
  });

  it("lanza ValidationError cuando efficiencyFactor es Infinity", () => {
    expect(() => calculateEmissions({ ...baseRequest, efficiencyFactor: Infinity })).toThrow(
      ValidationError,
    );
  });

  it("lanza ValidationError cuando efficiencyFactor excede el límite superior de sanidad", () => {
    expect(() =>
      calculateEmissions({
        ...baseRequest,
        efficiencyFactor: INPUT_LIMITS.MAX_EFFICIENCY_FACTOR + 0.1,
      }),
    ).toThrow(ValidationError);
  });

  it("acepta el valor límite superior válido de efficiencyFactor (boundary)", () => {
    expect(() =>
      calculateEmissions({ ...baseRequest, efficiencyFactor: INPUT_LIMITS.MAX_EFFICIENCY_FACTOR }),
    ).not.toThrow();
  });

  it("acepta el valor límite superior válido de distanceKm (boundary)", () => {
    expect(() =>
      calculateEmissions({ ...baseRequest, distanceKm: INPUT_LIMITS.MAX_DISTANCE_KM }),
    ).not.toThrow();
  });

  it("lanza ValidationError cuando distanceKm excede el límite superior de sanidad", () => {
    expect(() =>
      calculateEmissions({ ...baseRequest, distanceKm: INPUT_LIMITS.MAX_DISTANCE_KM + 1 }),
    ).toThrow(ValidationError);
  });

  it("lanza ValidationError cuando cargoWeightTonnes excede el límite superior de sanidad", () => {
    expect(() =>
      calculateEmissions({
        ...baseRequest,
        cargoWeightTonnes: INPUT_LIMITS.MAX_CARGO_WEIGHT_TONNES + 1,
      }),
    ).toThrow(ValidationError);
  });

  it("maneja valores extremos dentro de los límites de sanidad sin NaN/overflow", () => {
    const result = calculateEmissions({
      vehicleType: VehicleType.DIESEL,
      cargoWeightTonnes: INPUT_LIMITS.MAX_CARGO_WEIGHT_TONNES,
      distanceKm: INPUT_LIMITS.MAX_DISTANCE_KM,
      efficiencyFactor: INPUT_LIMITS.MAX_EFFICIENCY_FACTOR,
    });
    expect(Number.isFinite(result.emissionsKgCO2)).toBe(true);
    expect(Number.isNaN(result.emissionsKgCO2)).toBe(false);
  });

  it("es determinista: la misma entrada produce el mismo resultado numérico", () => {
    const first = calculateEmissions(baseRequest);
    const second = calculateEmissions(baseRequest);
    expect(first.emissionsKgCO2).toBe(second.emissionsKgCO2);
  });
});
