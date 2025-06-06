import * as vscode from 'vscode';

export class CommitPanel {
  public static currentPanel: CommitPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, intentionDescription: string, onCommit?: (commitMsg: string) => void) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.webview.html = this._getHtmlForWebview(intentionDescription);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    // 메시지 핸들러 추가
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === 'commit') {
          if (onCommit) onCommit(message.message);
          this.dispose();
        } else if (message.type === 'cancel') {
          this.dispose();
        }
      },
      null,
      this._disposables
    );
  }

  public static show(extensionUri: vscode.Uri, intentionDescription: string, onCommit?: (commitMsg: string) => void) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    if (CommitPanel.currentPanel) {
      CommitPanel.currentPanel._panel.reveal(column);
      CommitPanel.currentPanel._panel.webview.html = CommitPanel.currentPanel._getHtmlForWebview(intentionDescription);
      return;
    }
    const panel = vscode.window.createWebviewPanel('commitPanel', 'Intention Commit', column || vscode.ViewColumn.One, {
      enableScripts: true,
    });
    CommitPanel.currentPanel = new CommitPanel(panel, extensionUri, intentionDescription, onCommit);
  }

  public dispose() {
    CommitPanel.currentPanel = undefined;
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
    this._panel.dispose();
  }

  private _getHtmlForWebview(intentionDescription: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Intention Commit</title>
        <style>
          body { font-family: var(--vscode-font-family); padding: 16px; }
          .desc { margin-bottom: 8px; color: var(--vscode-editor-foreground); }
          textarea { width: 100%; min-height: 60px; margin-bottom: 12px; }
          button { margin-right: 8px; }
        </style>
      </head>
      <body>
        <h2>Commit Intention</h2>
        <div class="desc">Current Intention: <b>${intentionDescription}</b></div>
        <textarea id="commitMsg">${intentionDescription}</textarea>
        <div>
          <button onclick="commit()">Commit</button>
          <button onclick="cancel()">Cancel</button>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          function commit() {
            const msg = document.getElementById('commitMsg').value;
            vscode.postMessage({ type: 'commit', message: msg });
          }
          function cancel() {
            vscode.postMessage({ type: 'cancel' });
          }
        </script>
      </body>
      </html>
    `;
  }
}
