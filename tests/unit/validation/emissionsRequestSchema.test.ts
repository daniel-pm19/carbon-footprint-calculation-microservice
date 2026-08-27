import { calculateEmissionsRequestSchema } from "../../../src/validation/emissionsRequestSchema";
import { VehicleType } from "../../../src/types/emissions.types";

const validPayload = {
  vehicleType: VehicleType.DIESEL,
  cargoWeightTonnes: 10,
  distanceKm: 250,
  efficiencyFactor: 1,
};

describe("calculateEmissionsRequestSchema", () => {
  it("acepta un payload válido completo", () => {
    const result = calculateEmissionsRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rechaza payload sin el campo vehicleType", () => {
    const { vehicleType: _omit, ...rest } = validPayload;
    const result = calculateEmissionsRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rechaza payload con distanceKm como string", () => {
    const result = calculateEmissionsRequestSchema.safeParse({
      ...validPayload,
      distanceKm: "250",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza payload que no es un objeto JSON válido (ej. un array)", () => {
    const result = calculateEmissionsRequestSchema.safeParse([validPayload]);
    expect(result.success).toBe(false);
  });

  it("rechaza vehicleType fuera del enum soportado", () => {
    const result = calculateEmissionsRequestSchema.safeParse({
      ...validPayload,
      vehicleType: "GASOLINE",
    });
    expect(result.success).toBe(false);
  });
});
