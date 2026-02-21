import { createServer } from "./server";
import { env } from "./config/env";
import { printEnvironmentVariables } from "./util/env-printer";

const app = createServer();

app.listen(env.port, () => {
  console.log(`🚀 ${env.appName} v${env.appVersion}`);
  console.log(`🌎 Environment: ${env.nodeEnv}`);
  console.log(`📡 Running on port ${env.port}`);

  if (env.showEnv) {
    printEnvironmentVariables();
  }
});