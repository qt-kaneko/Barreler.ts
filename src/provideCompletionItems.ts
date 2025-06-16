import $vscode from "vscode";
import $path from "path";
import $ts from "typescript";

import { update } from "./update";

const _printer = $ts.createPrinter();
const _comment = `// @auto-generated\n`;

export async function provideCompletionItems(document: $vscode.TextDocument, position: $vscode.Position, token: $vscode.CancellationToken, context: $vscode.CompletionContext)
{
  let barrelPath = document.uri.fsPath;
  let dir = $path.dirname(barrelPath);

  let barrelSource = $ts.createSourceFile(``, ``, $ts.ScriptTarget.Latest);

  let uris = await $vscode.workspace.fs.readDirectory($vscode.Uri.file(dir));
  for (let [name, type] of uris)
  {
    let path = $path.join(dir, name);

    ({barrelSource} = await update(name, path, type, barrelSource));
  }

  let barrelText = _printer.printFile(barrelSource);

  barrelText = _comment + barrelText;

  let completionItem = new $vscode.CompletionItem(`auto-generated`, $vscode.CompletionItemKind.Snippet);
  completionItem.insertText = barrelText;
  return [completionItem];
}