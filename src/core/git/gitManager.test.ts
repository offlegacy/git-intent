import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EmptyCommitMessageError,
  GitError,
  IsNotGitRepositoryError,
} from "./errors";
import { __testing__, getGitService } from "./gitManager";

function createMockGit(overrides = {}) {
  return {
    checkIsRepo: vi.fn().mockResolvedValue(true),
    commit: vi.fn().mockResolvedValue({ commit: "abc123" }),
    revparse: vi.fn().mockResolvedValue("abc123"),
    branchLocal: vi.fn().mockResolvedValue({
      detached: false,
      current: "main",
    }),
    ...overrides,
  };
}

describe("GitService", () => {
  beforeEach(() => {
    __testing__.clearGlobalCache();
  });

  it("should cache git instances efficiently", () => {
    const mockGit = createMockGit();
    const mockFactory = vi.fn().mockReturnValue(mockGit);

    expect(__testing__.getGlobalCacheSize()).toBe(0);

    const service1 = getGitService({ gitProvider: mockFactory });
    const service2 = getGitService({ gitProvider: mockFactory });

    service1.commit("abc123");
    service2.commit("abc123");

    expect(__testing__.getGlobalCacheSize()).toBe(1);
  });

  describe("getProjectMetadata", () => {
    it("should handle git command failures", async () => {
      const mockGitFactory = vi.fn().mockReturnValue({
        revparse: vi.fn().mockRejectedValue(new Error("Git command failed")),
      });
      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.getProjectMetadata()).rejects.toThrow(GitError);
    });

    it("should only work inside a git repo", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockResolvedValue(false),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.getProjectMetadata()).rejects.instanceOf(
        IsNotGitRepositoryError,
      );
    });
  });

  describe("getBranchMetadata", () => {
    it("should handle detached HEAD state", async () => {
      const mockGit = createMockGit({
        branchLocal: vi.fn().mockResolvedValue({
          detached: true,
        }),
      });
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);
      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        "Cannot determine branch name in detached HEAD state",
      );
    });

    it("should only work inside a git repo", async () => {
      const mockGit = createMockGit({
        checkIsRepo: vi.fn().mockResolvedValue(false),
      });
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        IsNotGitRepositoryError,
      );
    });

    it("should handle git command failures", async () => {
      const mockGit = createMockGit({
        revparse: vi.fn().mockRejectedValue(new Error("Git command failed")),
      });
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);
      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        GitError,
      );
    });
  });

  describe("commit", () => {
    it("should handle commit success", async () => {
      const mockGit = createMockGit();

      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = getGitService({ gitProvider: mockGitFactory });
      const result = await service.commit("test message");

      expect(result).toBe("abc123");
      expect(mockGit.commit).toHaveBeenCalledWith("test message");
    });

    it("should not allow commit outside of git repo", async () => {
      const mockGit = createMockGit({
        checkIsRepo: vi.fn().mockResolvedValue(false),
      });
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = getGitService({ gitProvider: mockGitFactory });

      await expect(service.commit("test message")).rejects.instanceOf(
        IsNotGitRepositoryError,
      );
    });

    it("should not allow commit without message", async () => {
      const service = getGitService();

      await expect(service.commit("")).rejects.instanceOf(
        EmptyCommitMessageError,
      );
      await expect(service.commit("   ")).rejects.instanceOf(
        EmptyCommitMessageError,
      );
      await expect(service.commit("\n")).rejects.instanceOf(
        EmptyCommitMessageError,
      );
    });
  });
});
