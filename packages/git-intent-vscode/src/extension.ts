import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { IntentService } from './services/IntentService';
import { isGitRepository } from './utils';
import { IntentTreeProvider } from './views/IntentTreeProvider';
import { StatusBarManager } from './views/StatusBarManager';

/**
 * This method is called when the extension is activated
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('Activating Git Intent extension...');

  // Check if the current workspace is a Git repository
  const isGitRepo = await isGitRepository();
  if (!isGitRepo) {
    vscode.window.showWarningMessage(
      'Git Intent requires a Git repository. Please open a Git repository to use this extension.'
    );
    return;
  }

  // Initialize services
  const intentService = IntentService.getInstance(context);

  // Initialize tree view
  const intentTreeProvider = new IntentTreeProvider(context, intentService);
  const treeView = vscode.window.createTreeView('git-intent-view', {
    treeDataProvider: intentTreeProvider,
    showCollapseAll: false,
  });

  // Set the tree view reference for revealing items
  intentTreeProvider.setTreeView(treeView);

  // Initialize status bar
  const statusBarManager = new StatusBarManager(intentService);
  statusBarManager.initialize();

  // Register all commands
  registerCommands(context, intentService, intentTreeProvider, statusBarManager);

  // Add tree view and status bar to subscriptions
  context.subscriptions.push(treeView);
  context.subscriptions.push(statusBarManager);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get<boolean>('gitIntentWelcomeShown');
  if (!hasShownWelcome) {
    vscode.window
      .showInformationMessage(
        'Git Intent is now active! Define your commit intentions before coding for clearer, more atomic changes.',
        'Learn More'
      )
      .then((selection) => {
        if (selection === 'Learn More') {
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/offlegacy/git-intent'));
        }
      });

    context.globalState.update('gitIntentWelcomeShown', true);
  }

  // Update status bar to show current intent
  statusBarManager.updateStatusBar();

  // Log activation
  console.log('Git Intent extension activated');
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate(): void {
  console.log('Git Intent extension deactivated');
}
