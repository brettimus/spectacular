export function getPackageManager(
  defaultPackageManager: "npm" | "yarn" | "pnpm" | "bun" = "npm",
) {
  const packageManager = process.env.npm_config_user_agent?.split("/").at(0);
  if (!packageManager) {
    return defaultPackageManager;
  }
  const isValidPackageManager = ["npm", "yarn", "pnpm", "bun"].includes(
    packageManager,
  );
  if (!isValidPackageManager) {
    console.warn(
      `Invalid package manager: ${packageManager}. Using default: ${defaultPackageManager}`,
    );
    return defaultPackageManager;
  }
  return packageManager as "npm" | "yarn" | "pnpm" | "bun";
}
