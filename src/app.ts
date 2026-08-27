import express, { type Application } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { emissionsRouter } from "./routes/emissionsRoutes";

export function createApp(): Application {
  const app = express();

  // Límite de tamaño explícito: evita payloads gigantes como vector de DoS.
  app.use(express.json({ limit: "10kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1", emissionsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
