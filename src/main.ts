import { createServer } from "./server";
import { env } from "./config/env";
import { printEnvironmentVariables } from "./util/env-printer";
import { closeDatabase, connectDatabase } from "./infraestructure/database/postgres";
import { logger } from "./infraestructure/logger/logger";

async function bootstrap() { 
  await connectDatabase();

  const app = createServer();

  const server = app.listen(env.port, () => {
    console.log(`🚀 ${env.appName} v${env.appVersion}`);
    console.log(`🌎 Environment: ${env.nodeEnv}`);
    console.log(`📡 Running on port ${env.port}`);

    if (env.showEnv) {
      printEnvironmentVariables();
    }
  });

  const shutdown = async () => {
    logger.info("🛑 Shutting down gracefully...");

    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

}

bootstrap();