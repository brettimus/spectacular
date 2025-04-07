import { writeFile } from "node:fs/promises";
import { fromPromise } from "xstate";
import type { SaveSpecActorInput } from "@/xstate-prototypes/machines";

export const createCliSaveSpecActor = (projectDir: string) =>
  fromPromise<void, SaveSpecActorInput>(async ({ input }) => {
    await writeFile(projectDir, input.content);
  });
