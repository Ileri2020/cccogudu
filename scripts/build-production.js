import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nodeModules = path.join(projectRoot, "node_modules");
const environment = {
  ...process.env,
  NEXT_DIST_DIR: ".next-production",
};

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(nodeModules, script), ...args], {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

try {
  const generateStatus = run("prisma/build/index.js", ["generate"]);
  const generatedClient = path.join(nodeModules, ".prisma", "client", "index.js");
  if (generateStatus !== 0) {
    if (!existsSync(generatedClient)) process.exit(generateStatus);
    console.warn("Prisma Client generation could not replace a locked Windows engine; using the existing generated client.");
  }

  const buildStatus = run("next/dist/bin/next", ["build"]);
  if (buildStatus !== 0) process.exit(buildStatus);
} catch (error) {
  console.error("Production build failed:", error.message);
  process.exitCode = 1;
}
