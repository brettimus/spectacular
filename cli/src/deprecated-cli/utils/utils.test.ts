import * as fs from "node:fs";
import type { PathLike } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { convertSpecNameToFilename, pathFromInput } from "./utils";

// Mock the fs.existsSync function
vi.mock("node:fs", async () => {
  const actual = await vi.importActual("node:fs");
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

describe("convertSpecNameToFilename", () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.mocked(fs.existsSync).mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should convert spec name to filename", () => {
    // Mock that the file doesn't exist
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(convertSpecNameToFilename("My Spec")).toBe("my-spec.md");
  });

  it("should convert spec name to filename with slashes", () => {
    // Mock that the file doesn't exist
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(
      convertSpecNameToFilename(`My Spec${path.sep}With${path.sep}Slashes`),
    ).toBe("my-spec-with-slashes.md");
  });

  it("should add version suffix if file already exists", () => {
    // Mock that the file exists once and then doesn't exist
    vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
      return filePath.toString() === "my-spec.md";
    });

    expect(convertSpecNameToFilename("My Spec")).toBe("my-spec-v0.md");
  });

  it("should increment version if multiple versions exist", () => {
    // Mock that the file and v0 exist, but v1 doesn't
    vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
      const pathStr = filePath.toString();
      return pathStr === "my-spec.md" || pathStr === "my-spec-v0.md";
    });

    expect(convertSpecNameToFilename("My Spec")).toBe("my-spec-v1.md");
  });

  it("should handle files already containing md extension", () => {
    // Mock that the file exists
    vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
      return filePath.toString() === "my-spec.md";
    });

    expect(convertSpecNameToFilename("My Spec.md")).toBe("my-spec-v0.md");
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
