import { writeFile } from "node:fs/promises";
import { fromPromise } from "xstate";
import type { SaveSpecActorInput } from "@/xstate-prototypes/machines";
import path from "node:path";

export const createCliSaveSpecActor = (projectDir: string) =>
  fromPromise<void, SaveSpecActorInput>(async ({ input }) => {
    const filePath = path.join(projectDir, input.filename);
    await writeFile(filePath, input.content);
  });
