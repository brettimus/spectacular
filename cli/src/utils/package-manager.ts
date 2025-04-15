export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export const isValidPackageManager = (
  packageManager: unknown,
): packageManager is PackageManager => {
  if (typeof packageManager === "string") {
    return ["npm", "yarn", "pnpm", "bun"].includes(packageManager);
  }
  return false;
};

/**
 * Gets the package manager that launched the script
 * @NOTE - Does not work on Windows
 */
export function getPackageManager(
  defaultPackageManager: PackageManager = "npm",
) {
  const packageManager = process.env.npm_config_user_agent?.split("/").at(0);
  if (!packageManager) {
    return defaultPackageManager;
  }

  if (!isValidPackageManager(packageManager)) {
    console.warn(
      `Invalid package manager: ${packageManager}. Using default: ${defaultPackageManager}`,
    );
    return defaultPackageManager;
  }
  return packageManager as "npm" | "yarn" | "pnpm" | "bun";
}
