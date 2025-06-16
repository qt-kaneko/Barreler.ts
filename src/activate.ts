import $vscode from "vscode";

import { handle } from "./handle";
import { provideCompletionItems } from "./provideCompletionItems";
import { Mutex } from "./Mutex";

const _onDidCreateFilesMutex = new Mutex();
const _onDidRenameFilesMutex = new Mutex();

export function activate({subscriptions}: $vscode.ExtensionContext)
{
  subscriptions.push(
    $vscode.workspace.onDidCreateFiles(onDidCreateFiles),
    $vscode.workspace.onWillDeleteFiles(onWillDeleteFiles),
    $vscode.workspace.onWillRenameFiles(onWillRenameFiles),
    $vscode.workspace.onDidRenameFiles(onDidRenameFiles),
    $vscode.workspace.onWillSaveTextDocument(onWillSaveTextDocument),
    $vscode.languages.registerCompletionItemProvider(`typescript`, {provideCompletionItems})
  );
}

function onDidCreateFiles(e: $vscode.FileCreateEvent)
{
  _onDidCreateFilesMutex.lock(async () => {
    for (let uri of e.files)
    {
      await handle(uri.fsPath, true);
    }
  });
}
function onWillDeleteFiles(e: $vscode.FileWillDeleteEvent)
{
  e.waitUntil((async () => {
    for (let uri of e.files)
    {
      await handle(uri.fsPath, true);
    }
  })());
}
function onWillRenameFiles(e: $vscode.FileWillRenameEvent)
{
  e.waitUntil((async () => {
    for (let {oldUri, newUri} of e.files)
    {
      await handle(oldUri.fsPath, false);
    }
  })());
}
async function onDidRenameFiles(e: $vscode.FileRenameEvent)
{
  _onDidRenameFilesMutex.lock(async () => {
    for (let {oldUri, newUri} of e.files)
    {
      await handle(newUri.fsPath, true);
    }
  });
}
async function onWillSaveTextDocument(e: $vscode.TextDocumentWillSaveEvent)
{
  e.waitUntil((async () => {
    await handle(e.document.uri.fsPath, true);
  })());
}