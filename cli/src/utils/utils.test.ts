import { describe, expect, it } from "vitest";
import { convertSpecNameToFilename, pathFromInput } from "./utils";
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

describe("pathFromInput", () => {
  const cwd = "/Users/brett";
  const projectsDir = "/Users/brett/projects";

  it("should add cwd to bare project names", () => {
    expect(pathFromInput("my-project", cwd)).toBe("/Users/brett/my-project");
  });

  it("should add cwd to project names in projects directory", () => {
    expect(pathFromInput("my-project", projectsDir)).toBe(
      "/Users/brett/projects/my-project",
    );
  });

  it("should handle relative paths with ../", () => {
    expect(pathFromInput("../my-project", cwd)).toBe("../my-project");
  });

  it("should handle relative paths with ./", () => {
    expect(pathFromInput("./my-project", projectsDir)).toBe("./my-project");
  });

  it("should handle absolute paths", () => {
    const absolutePath = "/absolute/path/to/project";
    expect(pathFromInput(absolutePath, cwd)).toBe(absolutePath);
  });

  it("should handle nested project names", () => {
    expect(pathFromInput("folder/my-project", cwd)).toBe("folder/my-project");
  });
});
