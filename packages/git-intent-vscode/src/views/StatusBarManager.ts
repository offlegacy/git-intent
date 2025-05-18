import type { IntentionalCommit } from '@offlegacy/git-intent-core';
import * as vscode from 'vscode';
import type { IntentService } from '../services/IntentService';

/**
 * Manages the status bar item that shows the current active intent
 */
export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private currentIntent: IntentionalCommit | undefined;
  private updateInterval: NodeJS.Timeout | undefined;

  constructor(private readonly intentService: IntentService) {
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100 // Priority (higher number = more to the left)
    );

    // Set initial properties
    this.statusBarItem.name = 'Git Intent';
    this.statusBarItem.command = 'git-intent-vscode.showCurrentIntent';

    // Start with hidden status
    this.statusBarItem.hide();
  }

  /**
   * Initialize the status bar item
   */
  public initialize(): void {
    // Show the status bar item
    this.statusBarItem.show();

    // Update immediately
    this.updateStatusBar();

    // Set up interval to update every 30 seconds
    this.updateInterval = setInterval(() => this.updateStatusBar(), 30000);
  }

  /**
   * Update the status bar with the current intent information
   */
  public async updateStatusBar(): Promise<void> {
    try {
      // Get the current active intent
      this.currentIntent = await this.intentService.getCurrentIntent();

      if (this.currentIntent) {
        // Show the current intent
        this.statusBarItem.text = `$(play) Intent: ${this.truncateMessage(this.currentIntent.message, 30)}`;
        this.statusBarItem.tooltip = `Current Intent: ${this.currentIntent.message}\nStatus: In Progress\nClick to view details`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.show();
      } else {
        // No active intent
        this.statusBarItem.text = '$(circle-outline) No Active Intent';
        this.statusBarItem.tooltip = 'No intent is currently in progress\nClick to create a new intent';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.show();
      }
    } catch (error) {
      console.error('Error updating status bar:', error);
      this.statusBarItem.text = '$(error) Intent Error';
      this.statusBarItem.tooltip = `Error: ${error instanceof Error ? error.message : String(error)}`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
      this.statusBarItem.show();
    }
  }

  /**
   * Truncate a message to a specific length
   */
  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }
    return `${message.substring(0, maxLength - 3)}...`;
  }

  /**
   * Dispose of the status bar item and interval
   */
  public dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
    this.statusBarItem.dispose();
  }
}
