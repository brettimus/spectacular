import { downloadTemplate as gigetDownloadTemplate } from "giget";
import { fromPromise } from "xstate/actors";

export type DownloadTemplateInput = {
  projectDir: string;
};

export const downloadTemplateActor = fromPromise<void, DownloadTemplateInput>(
  async ({ input: { projectDir } }) => {
    await downloadTemplate(projectDir);
  },
);

export async function downloadTemplate(projectDir: string) {
  const templateUrl = "github:brettimus/mega-honc";

  await gigetDownloadTemplate(templateUrl, {
    cwd: projectDir,
    dir: ".",
    force: true,
    provider: "github",
  });
}
