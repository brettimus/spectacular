export function getPackageManager() {
  return process.env.npm_config_user_agent?.split("/").at(0);
}
