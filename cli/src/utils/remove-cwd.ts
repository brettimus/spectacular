import type { Context } from "@/context";

export function removeCwd(ctx: Context, path: string) {
  return path.replace(ctx.cwd, "");
}
