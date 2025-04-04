import type { Context } from "@/deprecated-cli/context";

export function removeCwd(ctx: Context, path: string) {
  return path.replace(ctx.cwd, "");
}
