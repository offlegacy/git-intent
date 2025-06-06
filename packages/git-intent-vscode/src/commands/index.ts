import * as vscode from 'vscode';
import type { IntentService } from '../services/IntentService';
import { CommitPanel } from '../views/CommitPanel';
import type { IntentTreeProvider } from '../views/IntentTreeProvider';
import type { StatusBarManager } from '../views/StatusBarManager';

/**
 * Register all commands for the extension
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  intentService: IntentService,
  treeProvider: IntentTreeProvider,
  statusBarManager: StatusBarManager
): void {
  // Register open commit panel command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.openCommitPanel', async () => {
      try {
        const currentIntent = await intentService.getCurrentIntent();
        if (!currentIntent) {
          vscode.window.showInformationMessage('No active intent to commit');
          return;
        }
        CommitPanel.show(context.extensionUri, currentIntent.message, async (commitMsg: string) => {
          try {
            await intentService.commitIntent(currentIntent.id, commitMsg);
            treeProvider.refresh();
            statusBarManager.updateStatusBar();
            vscode.window.showInformationMessage('Intent committed successfully');
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to commit intent: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        });
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to open commit panel: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register add intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.addIntent', async () => {
      const message = await vscode.window.showInputBox({
        placeHolder: 'Enter intent message (e.g., "feat: implement user login")',
        prompt: 'Create a new intent',
      });

      if (!message) {
        return;
      }

      try {
        await intentService.addIntent(message);
        treeProvider.refresh();
        statusBarManager.updateStatusBar();
        vscode.window.showInformationMessage(`Intent created: ${message}`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to create intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register start intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.startIntent', async (treeItem) => {
      try {
        // If called from command palette, show quick pick to select intent
        if (!treeItem) {
          const intents = await intentService.getIntents();
          const createdIntents = intents.filter((intent) => intent.status === 'created');

          if (createdIntents.length === 0) {
            vscode.window.showInformationMessage('No intents available to start. Create one first.');
            return;
          }

          const selected = await vscode.window.showQuickPick(
            createdIntents.map((intent) => ({
              label: intent.message,
              description: `ID: ${intent.id}`,
              intent,
            })),
            { placeHolder: 'Select an intent to start' }
          );

          if (!selected) {
            return;
          }

          await intentService.startIntent(selected.intent.id);
        } else {
          // If called from tree item context menu
          await intentService.startIntent(treeItem.intent.id);
        }

        treeProvider.refresh();
        statusBarManager.updateStatusBar();
        vscode.window.showInformationMessage('Intent started successfully');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to start intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register commit intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.commitIntent', async (treeItem) => {
      try {
        const currentIntent = treeItem?.intent || (await intentService.getCurrentIntent());

        if (!currentIntent) {
          vscode.window.showInformationMessage('No active intent to commit');
          return;
        }

        const additionalMessage = await vscode.window.showInputBox({
          placeHolder: 'Enter additional commit message (optional)',
          prompt: 'Commit intent',
        });

        await intentService.commitIntent(currentIntent.id, additionalMessage || undefined);
        treeProvider.refresh();
        statusBarManager.updateStatusBar();
        vscode.window.showInformationMessage('Intent committed successfully');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to commit intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register cancel intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.cancelIntent', async (treeItem) => {
      try {
        const currentIntent = treeItem?.intent || (await intentService.getCurrentIntent());

        if (!currentIntent) {
          vscode.window.showInformationMessage('No active intent to cancel');
          return;
        }

        const confirmation = await vscode.window.showWarningMessage(
          `Are you sure you want to cancel the intent: "${currentIntent.message}"?`,
          { modal: true },
          'Yes',
          'No'
        );

        if (confirmation !== 'Yes') {
          return;
        }

        await intentService.cancelIntent(currentIntent.id);
        treeProvider.refresh();
        statusBarManager.updateStatusBar();
        vscode.window.showInformationMessage('Intent cancelled successfully');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to cancel intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register delete intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.deleteIntent', async (treeItem) => {
      if (!treeItem) {
        vscode.window.showInformationMessage('Please select an intent to delete');
        return;
      }

      try {
        const confirmation = await vscode.window.showWarningMessage(
          `Are you sure you want to delete the intent: "${treeItem.intent.message}"?`,
          { modal: true },
          'Yes',
          'No'
        );

        if (confirmation !== 'Yes') {
          return;
        }

        await intentService.deleteIntent(treeItem.intent.id);
        treeProvider.refresh();
        statusBarManager.updateStatusBar();
        vscode.window.showInformationMessage('Intent deleted successfully');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to delete intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.refreshIntents', () => {
      treeProvider.refresh();
      statusBarManager.updateStatusBar();
      vscode.window.showInformationMessage('Intents refreshed');
    })
  );

  // Register show current intent command
  context.subscriptions.push(
    vscode.commands.registerCommand('git-intent-vscode.showCurrentIntent', async () => {
      try {
        const currentIntent = await intentService.getCurrentIntent();

        if (!currentIntent) {
          const createNew = await vscode.window.showInformationMessage(
            'No active intent. Would you like to create a new one?',
            'Yes',
            'No'
          );

          if (createNew === 'Yes') {
            vscode.commands.executeCommand('git-intent-vscode.addIntent');
          }
          return;
        }

        // Show detailed information about the current intent
        const actions = ['Commit', 'Cancel', 'View in Tree'];
        const selected = await vscode.window.showInformationMessage(
          `Current Intent: ${currentIntent.message}`,
          {
            modal: true,
            detail: `Status: In Progress\nCreated: ${new Date(currentIntent.metadata.createdAt).toLocaleString()}\nStarted: ${currentIntent.metadata.startedAt ? new Date(currentIntent.metadata.startedAt).toLocaleString() : 'N/A'}`,
          },
          ...actions
        );

        if (selected === 'Commit') {
          vscode.commands.executeCommand('git-intent-vscode.commitIntent');
        } else if (selected === 'Cancel') {
          vscode.commands.executeCommand('git-intent-vscode.cancelIntent');
        } else if (selected === 'View in Tree') {
          // Focus the tree view and try to reveal the current intent
          vscode.commands.executeCommand('git-intent-view.focus');
          treeProvider.revealCurrentIntent();
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error showing current intent: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );
}
