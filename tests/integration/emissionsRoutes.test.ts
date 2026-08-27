import request from "supertest";
import { createApp } from "../../src/app";
import { ErrorCodes } from "../../src/errors/errorCodes";

const app = createApp();

const validPayload = {
  vehicleType: "DIESEL",
  cargoWeightTonnes: 10,
  distanceKm: 250,
  efficiencyFactor: 1,
};

describe("POST /api/v1/emissions/calculate", () => {
  it("devuelve 200 y el cálculo correcto para un payload válido", async () => {
    const response = await request(app).post("/api/v1/emissions/calculate").send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.emissionsKgCO2).toBeCloseTo(250 * 10 * 0.115 * 1);
    expect(response.body.baseEmissionFactorUsed).toBe(0.115);
  });

  it("devuelve 400 VALIDATION_ERROR para un payload malformado (campo faltante)", async () => {
    const { vehicleType: _omit, ...incompletePayload } = validPayload;
    const response = await request(app)
      .post("/api/v1/emissions/calculate")
      .send(incompletePayload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });

  it("devuelve 400 INVALID_DISTANCE para distancia negativa", async () => {
    const response = await request(app)
      .post("/api/v1/emissions/calculate")
      .send({ ...validPayload, distanceKm: -5 });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ErrorCodes.INVALID_DISTANCE);
  });

  it("devuelve 400 VALIDATION_ERROR para un tipo de vehículo no soportado (rechazado por Zod antes de llegar al dominio)", async () => {
    const response = await request(app)
      .post("/api/v1/emissions/calculate")
      .send({ ...validPayload, vehicleType: "GASOLINE" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });

  it("no expone stack trace ni detalles internos en la respuesta de error", async () => {
    const response = await request(app)
      .post("/api/v1/emissions/calculate")
      .send({ ...validPayload, distanceKm: -5 });

    expect(response.body.stack).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/);
  });
});

describe("GET /health", () => {
  it("responde 200 ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("Rutas inexistentes", () => {
  it("devuelve 404 para una ruta no definida", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe(ErrorCodes.NOT_FOUND);
  });
});
