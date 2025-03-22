import { describe, expect, it } from "vitest";
import { convertSpecNameToFilename } from "./utils";
import path from "node:path";
describe("convertSpecNameToFilename", () => {
  it("should convert spec name to filename", () => {
    expect(convertSpecNameToFilename("My Spec")).toBe("my-spec.md");
  });

  it("should convert spec name to filename with slashes", () => {
    expect(
      convertSpecNameToFilename(`My Spec${path.sep}With${path.sep}Slashes`),
    ).toBe("my-spec-with-slashes.md");
  });
});
