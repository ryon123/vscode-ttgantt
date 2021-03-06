// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"ttgantt" is now activated');

  vscode.workspace.onDidChangeTextDocument(
    (e: vscode.TextDocumentChangeEvent) => {
      let lastTimestamp = new Date().getTime();
      setTimeout(() => {
        if (new Date().getTime() - lastTimestamp >= 400) {
          if(TTGanttPanel.currentPanel !== undefined) {
            TTGanttPanel.currentPanel.update(e.document.getText());
          }
        }
      }, 500);
    },
    null,
    context.subscriptions
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('ttgantt.showGantt', () => {
    TTGanttPanel.createOrShow(context.extensionPath);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

class TTGanttPanel {
  public static currentPanel: TTGanttPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  
  public static createOrShow(extensionPath: string) {
    // TODO: "show" implementation

    const panel = vscode.window.createWebviewPanel(
      "TTGantt", // Identifies
      "Gantt chart", // Title
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );
    TTGanttPanel.currentPanel = new TTGanttPanel(panel, extensionPath);

  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;
    
    // TODO: move to the out of constructor(?)
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    this.update(editor.document.getText());
  }

  // update panel view
  public update(input: string) {
    const assets_css = this._getWebViewUri(this._panel.webview, [this._extensionPath, "assets", "ttgantt.css"]);
    const assets_js = this._getWebViewUri(this._panel.webview, [this._extensionPath, "out", "frontend", "ttgantt.js"]);
    const assets_libjs = this._getWebViewUri(this._panel.webview, [this._extensionPath, "assets", "html2canvas.min.js"]);
    this._panel.webview.html = this._getWebviewContent(assets_css, assets_js, assets_libjs);
    this._panel.webview.postMessage({ command: 'update', text: input});
  }

  private _getWebViewUri(webview: vscode.Webview, paths: string[]) {
    const p = path.join(...paths);
    const local = vscode.Uri.file(p);
    return webview.asWebviewUri(local);
  }

  private _getWebviewContent(css: vscode.Uri, js: vscode.Uri, libjs: vscode.Uri) {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="${css}" />
      </head>
      <body>
        <script src="${libjs}"></script>
        <div id="TTGantt">
          <div id="month-year-area" class="month-year-area"></div>
          <div id="day-task-area" class="day-task-area"></div>
          <script src="${js}"></script>
        </div>
        <button class="save-button" onclick="onSaveClick();">SAVE</button>
      </body>
    </html>`;
  }
}
