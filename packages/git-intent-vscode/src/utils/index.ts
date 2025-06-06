import * as path from 'node:path';
import * as vscode from 'vscode';

/**
 * Get the current workspace folder
 */
export function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return undefined;
  }

  // If there's only one workspace folder, return it
  if (vscode.workspace.workspaceFolders.length === 1) {
    return vscode.workspace.workspaceFolders[0];
  }

  // If there are multiple workspace folders, use the one that contains the active file
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeDocumentUri = activeEditor.document.uri;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeDocumentUri);
    if (workspaceFolder) {
      return workspaceFolder;
    }
  }

  // Default to the first workspace folder
  return vscode.workspace.workspaceFolders[0];
}

/**
 * Check if the current workspace is a Git repository
 */
export async function isGitRepository(): Promise<boolean> {
  const workspaceFolder = getWorkspaceFolder();

  if (!workspaceFolder) {
    console.log('No workspace folder found');
    return false;
  }

  console.log(`Checking Git repository for workspace: ${workspaceFolder.uri.fsPath}`);

  try {
    // Get the Git extension
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      console.log('Git extension not found');
      return false;
    }

    // Activate the extension if it's not already active
    if (!gitExtension.isActive) {
      console.log('Activating Git extension...');
      await gitExtension.activate();
    }

    // Now it's safe to access the exports
    const api = gitExtension.exports.getAPI(1);
    if (!api) {
      console.log('Git API not available');
      return false;
    }

    const repositories = api.repositories;
    console.log(`Found ${repositories.length} Git repositories`);

    // Log all repository paths for debugging
    repositories.forEach((repo, index) => {
      console.log(`Repository ${index}: ${repo.rootUri.fsPath}`);
    });

    // Try more flexible matching approach
    for (const repo of repositories) {
      const repoPath = repo.rootUri.fsPath;
      const workspacePath = workspaceFolder.uri.fsPath;

      console.log(`Comparing workspace path: ${workspacePath}`);
      console.log(`With repository path: ${repoPath}`);

      // Check if workspace is inside repository or vice versa
      if (repoPath.startsWith(workspacePath) || workspacePath.startsWith(repoPath)) {
        console.log('Match found!');
        return true;
      }
    }

    // As a fallback, check if .git directory exists in workspace
    try {
      const gitDir = path.join(workspaceFolder.uri.fsPath, '.git');
      const stats = await vscode.workspace.fs.stat(vscode.Uri.file(gitDir));
      if (stats.type === vscode.FileType.Directory) {
        console.log('Found .git directory in workspace');
        return true;
      }
    } catch (e) {
      console.log('No .git directory found in workspace');
    }

    console.log('No matching Git repository found');
    return false;
  } catch (error) {
    console.error('Error checking Git repository:', error);
    return false;
  }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return dateString;
  }
}
