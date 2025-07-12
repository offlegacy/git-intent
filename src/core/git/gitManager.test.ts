import { describe, expect, it, vi } from "vitest";
import {
  EmptyCommitMessageError,
  GitError,
  IsNotGitRepositoryError,
} from "./errors";
import { createGitService } from "./gitManager";

describe("GitService", () => {
  describe("getProjectMetadata", () => {
    it("should handle git command failures", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockResolvedValue(true),
        revparse: vi.fn().mockRejectedValue(new Error("Git command failed")),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);
      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.getProjectMetadata()).rejects.toThrow(GitError);
    });

    it("should only work inside a git repo", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockReturnValue(false),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.getProjectMetadata()).rejects.instanceOf(
        IsNotGitRepositoryError,
      );
    });
  });

  describe("getBranchMetadata", () => {
    it("should handle detached HEAD state", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockResolvedValue(true),
        branchLocal: vi.fn().mockResolvedValue({
          detached: true,
        }),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);
      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        "Cannot determine branch name in detached HEAD state",
      );
    });

    it("should only work inside a git repo", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockReturnValue(false),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        IsNotGitRepositoryError,
      );
    });

    it("should handle git command failures", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockResolvedValue(true),
        branchLocal: vi.fn().mockResolvedValue({
          detached: false,
          current: "main",
        }),
        revparse: vi.fn().mockRejectedValue(new Error("Git command failed")),
      };

      const mockGitFactory = vi.fn().mockReturnValue(mockGit);
      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.getBranchMetadata("project-id")).rejects.toThrow(
        GitError,
      );
    });
  });

  describe("commit", () => {
    it("should handle commit success", async () => {
      const mockCommitResult = { commit: "abc123" };

      const mockGit = {
        commit: vi.fn().mockResolvedValue(mockCommitResult),
        checkIsRepo: vi.fn().mockResolvedValue(true),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = createGitService({ gitProvider: mockGitFactory });
      const result = await service.commit("test message");

      expect(result).toBe("abc123");
      expect(mockGit.commit).toHaveBeenCalledWith("test message");
    });

    it("should not allow commit outside of git repo", async () => {
      const mockGit = {
        checkIsRepo: vi.fn().mockReturnValue(false),
      };
      const mockGitFactory = vi.fn().mockReturnValue(mockGit);

      const service = createGitService({ gitProvider: mockGitFactory });

      await expect(service.commit("test message")).rejects.instanceOf(
        IsNotGitRepositoryError,
      );
    });

    it("should not allow commit without message", async () => {
      const service = createGitService();

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
