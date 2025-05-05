import type { IntentStatus, IntentionalCommit } from '@offlegacy/git-intent-core';
import * as vscode from 'vscode';
import type { IntentService } from '../services/IntentService';

/**
 * Tree item representing a Git Intent
 */
export class IntentTreeItem extends vscode.TreeItem {
  constructor(
    public readonly intent: IntentionalCommit,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(intent.message, collapsibleState);

    // Set tooltip with detailed information
    this.tooltip = this.getTooltipText();

    // Set description based on status
    this.description = this.getStatusText();

    // Set icon based on status
    this.iconPath = this.getIconForStatus();

    // Set context value for menu contributions
    this.contextValue = `intent.${intent.status}`;

    // Highlight in-progress intents
    if (intent.status === 'in_progress') {
      this.resourceUri = vscode.Uri.parse('git-intent://current-intent');
      this.iconPath = new vscode.ThemeIcon(
        'play-circle',
        new vscode.ThemeColor('gitDecoration.stageModifiedResourceForeground')
      );
    }
  }

  private getTooltipText(): string {
    const { intent } = this;
    const lines = [
      `ID: ${intent.id}`,
      `Message: ${intent.message}`,
      `Status: ${this.getStatusText()}`,
      `Created: ${new Date(intent.metadata.createdAt).toLocaleString()}`,
    ];

    if (intent.metadata.startedAt) {
      lines.push(`Started: ${new Date(intent.metadata.startedAt).toLocaleString()}`);
    }

    if (intent.metadata.completedAt) {
      lines.push(`Completed: ${new Date(intent.metadata.completedAt).toLocaleString()}`);
    }

    if (intent.metadata.cancelledAt) {
      lines.push(`Cancelled: ${new Date(intent.metadata.cancelledAt).toLocaleString()}`);
    }

    return lines.join('\n');
  }

  private getStatusText(): string {
    switch (this.intent.status) {
      case 'created':
        return 'Created';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '';
    }
  }

  private getIconForStatus(): vscode.ThemeIcon {
    switch (this.intent.status) {
      case 'created':
        return new vscode.ThemeIcon('circle-outline');
      case 'in_progress':
        return new vscode.ThemeIcon('play-circle');
      case 'completed':
        return new vscode.ThemeIcon('check-circle');
      case 'cancelled':
        return new vscode.ThemeIcon('circle-slash');
      default:
        return new vscode.ThemeIcon('circle');
    }
  }
}

/**
 * TreeDataProvider for Git Intents
 */
export class IntentTreeProvider implements vscode.TreeDataProvider<IntentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<IntentTreeItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private treeView: vscode.TreeView<IntentTreeItem> | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly intentService: IntentService
  ) {}

  /**
   * Set the tree view reference
   */
  public setTreeView(treeView: vscode.TreeView<IntentTreeItem>): void {
    this.treeView = treeView;
  }

  /**
   * Refresh the tree view
   */
  public refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * Get the tree item for a given element
   */
  getTreeItem(element: IntentTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get the children of a given element
   */
  async getChildren(element?: IntentTreeItem): Promise<IntentTreeItem[]> {
    // Root level - show all intents
    if (!element) {
      const intents = await this.intentService.getIntents();

      // Sort intents by status and creation date
      return this.sortIntents(intents).map(
        (intent) => new IntentTreeItem(intent, vscode.TreeItemCollapsibleState.None)
      );
    }

    // No children for intent items
    return [];
  }

  /**
   * Sort intents by status and creation date
   */
  private sortIntents(intents: IntentionalCommit[]): IntentionalCommit[] {
    const statusOrder: Record<IntentStatus, number> = {
      in_progress: 0,
      created: 1,
      completed: 2,
      cancelled: 3,
    };

    return [...intents].sort((a, b) => {
      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      // Then sort by creation date (newest first)
      return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
    });
  }

  /**
   * Reveal the current intent in the tree view
   */
  public async revealCurrentIntent(): Promise<void> {
    if (!this.treeView) {
      return;
    }

    try {
      const currentIntent = await this.intentService.getCurrentIntent();
      if (!currentIntent) {
        return;
      }

      // Get all tree items
      const allItems = await this.getChildren();

      // Find the item that matches the current intent
      const currentItem = allItems.find((item) => item.intent.id === currentIntent.id);

      if (currentItem) {
        // Reveal and select the current intent
        this.treeView.reveal(currentItem, { select: true, focus: true });
      }
    } catch (error) {
      console.error('Error revealing current intent:', error);
    }
  }
}
