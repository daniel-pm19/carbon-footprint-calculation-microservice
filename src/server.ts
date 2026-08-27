import { createApp } from "./app";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`Carbon Tracker Service escuchando en el puerto ${PORT}`);
});
