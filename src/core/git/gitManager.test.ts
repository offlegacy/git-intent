import { describe, expect, it, vi } from "vitest";
import { EmptyCommitMessageError, IsNotGitRepositoryError } from "./errors";
import { createGitService } from "./gitManager";

describe("GitService", () => {
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
