import VSCODE from "vscode";

import { update } from "./update";
import { provideCompletionItems } from "./provideCompletionItems";

export function activate({subscriptions}: VSCODE.ExtensionContext)
{
  subscriptions.push(
    VSCODE.workspace.onDidCreateFiles(onDidCreateFiles),
    VSCODE.workspace.onDidDeleteFiles(onDidDeleteFiles),
    VSCODE.workspace.onDidRenameFiles(onDidRenameFiles),
    VSCODE.workspace.onDidSaveTextDocument(onDidSaveTextDocument),
    VSCODE.languages.registerCompletionItemProvider(
      `typescript`,
      {provideCompletionItems}
    )
  );
}

async function onDidCreateFiles(e: VSCODE.FileCreateEvent)
{
  for (let uri of e.files)
  {
    await update(uri.fsPath, true);
  }
}
async function onDidDeleteFiles(e: VSCODE.FileDeleteEvent)
{
  for (let uri of e.files)
  {
    await update(uri.fsPath, false);
  }
}
async function onDidRenameFiles(e: VSCODE.FileRenameEvent)
{
  for (let {oldUri, newUri} of e.files)
  {
    await update(oldUri.fsPath, false);
    await update(newUri.fsPath, true);
  }
}
async function onDidSaveTextDocument(e: VSCODE.TextDocument)
{
  await update(e.uri.fsPath, true);
}