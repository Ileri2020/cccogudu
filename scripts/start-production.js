import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const nextCli = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextCli, "start"], {
  cwd: projectRoot,
  env: { ...process.env, NEXT_DIST_DIR: ".next-production" },
  stdio: "inherit",
});

if (result.error) {
  console.error("Could not start the production server:", result.error.message);
  process.exitCode = 1;
} else if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
