import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaveSpecActorInput } from "@/xstate-prototypes/machines";
import { fromPromise } from "xstate";

export const createCliSaveSpecActor = (projectDir: string) =>
  fromPromise<void, SaveSpecActorInput>(async ({ input }) => {
    const filePath = path.join(projectDir, input.filename);
    await writeFile(filePath, input.content);
  });
