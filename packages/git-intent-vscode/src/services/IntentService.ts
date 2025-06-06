import { getWorkspaceFolder } from '@/utils';
import { GitService, type IntentionalCommit, storage } from '@offlegacy/git-intent-core';
import * as vscode from 'vscode';

/**
 * Service for managing Git Intents using the git-intent-core package
 */
export class IntentService {
  private static instance: IntentService;
  private workspacePath: string | undefined;
  private gitService: GitService;

  private constructor(private readonly context: vscode.ExtensionContext) {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
      throw new Error('No workspace folder found');
    }

    this.workspacePath = workspaceFolder.uri.fsPath;

    this.gitService = GitService.getInstance(this.workspacePath);
    this.initializeStorage();
  }

  /**
   * Get the singleton instance of IntentService
   */
  public static getInstance(context: vscode.ExtensionContext): IntentService {
    if (!IntentService.instance) {
      IntentService.instance = new IntentService(context);
    }
    return IntentService.instance;
  }

  /**
   * Initialize git-intent-core storage
   */
  private async initializeStorage(): Promise<void> {
    try {
      console.log(`Initializing Git Intent storage for workspace: ${this.workspacePath}`);

      // Initialize git-intent-core storage
      await storage.initializeRefs(this.workspacePath);
      console.log('Git Intent storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Git Intent storage:', error);
      vscode.window.showErrorMessage(`Failed to initialize Git Intent storage: ${(error as Error).message}`);
    }
  }

  /**
   * Get all intents
   */
  public async getIntents(): Promise<IntentionalCommit[]> {
    try {
      return await storage.loadCommits(this.workspacePath);
    } catch (error) {
      console.error('Failed to load intents:', error);
      vscode.window.showErrorMessage(`Failed to load intents: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Add a new intent
   */
  public async addIntent(message: string): Promise<IntentionalCommit> {
    try {
      const id = await storage.addCommit({
        message,
        status: 'created',
        metadata: {
          createdAt: new Date().toISOString(),
        },
      });

      // Get the newly created intent
      const intents = await this.getIntents();
      const newIntent = intents.find((intent) => intent.id === id);

      if (!newIntent) {
        throw new Error('Failed to retrieve newly created intent');
      }

      return newIntent;
    } catch (error) {
      console.error('Failed to add intent:', error);
      vscode.window.showErrorMessage(`Failed to add intent: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Start working on an intent
   */
  public async startIntent(id: string): Promise<IntentionalCommit | undefined> {
    try {
      await storage.updateCommitStatus(id, 'in_progress');

      // Get the updated intent
      const intents = await this.getIntents();
      return intents.find((intent) => intent.id === id);
    } catch (error) {
      console.error('Failed to start intent:', error);
      vscode.window.showErrorMessage(`Failed to start intent: ${(error as Error).message}`);
      return undefined;
    }
  }

  /**
   * Commit an intent
   */
  public async commitIntent(id: string, additionalMessage?: string): Promise<IntentionalCommit | undefined> {
    try {
      const intents = await this.getIntents();
      // If there's an additional message, update the intent message
      const intent = intents.find((intent) => intent.id === id);

      if (!intent) {
        throw new Error('Intent not found');
      }

      const updatedMessage = additionalMessage ? `${intent.message}\n\n${additionalMessage}` : intent.message;

      await this.gitService.createCommit(updatedMessage, this.workspacePath);
      await storage.updateCommitMessage(id, updatedMessage);
      await storage.updateCommitStatus(id, 'completed');

      return intents.find((intent) => intent.id === id);
    } catch (error) {
      console.error('Failed to commit intent:', error);
      vscode.window.showErrorMessage(`Failed to commit intent: ${(error as Error).message}`);
      return undefined;
    }
  }

  /**
   * Cancel an intent
   */
  public async cancelIntent(id: string): Promise<IntentionalCommit | undefined> {
    try {
      await storage.updateCommitStatus(id, 'cancelled');

      // Get the updated intent
      const intents = await this.getIntents();
      return intents.find((intent) => intent.id === id);
    } catch (error) {
      console.error('Failed to cancel intent:', error);
      vscode.window.showErrorMessage(`Failed to cancel intent: ${(error as Error).message}`);
      return undefined;
    }
  }

  /**
   * Delete an intent
   */
  public async deleteIntent(id: string): Promise<boolean> {
    try {
      await storage.deleteCommit(id);
      return true;
    } catch (error) {
      console.error('Failed to delete intent:', error);
      vscode.window.showErrorMessage(`Failed to delete intent: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get the current active intent
   */
  public async getCurrentIntent(): Promise<IntentionalCommit | undefined> {
    try {
      const intents = await this.getIntents();
      return intents.find((intent) => intent.status === 'in_progress');
    } catch (error) {
      console.error('Failed to get current intent:', error);
      vscode.window.showErrorMessage(`Failed to get current intent: ${(error as Error).message}`);
      return undefined;
    }
  }
}
