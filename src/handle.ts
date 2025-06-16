import $path from "path";
import $ts from "typescript";
import $vscode from "vscode";

import { update } from "./update";

const _printer = $ts.createPrinter();
const _rangeAll = new $vscode.Range(0, 0, Number.MAX_SAFE_INTEGER, 0);
const _comment = `// @auto-generated\n`;

export async function handle(path: string, exists: boolean)
{
  let dir = $path.dirname(path);
  let name = $path.basename(path);

  if (name === `index.ts`) // If index.ts, treat as directory
  {
    return await handle(dir, exists);
  }

  let barrelPath = $path.join(dir, `index.ts`);

  let barrelDocument = await $vscode.workspace
    .openTextDocument(barrelPath)
    .then(
      (value) => value,
      // Bruh, exact error is lost :(
      // https://github.com/microsoft/vscode/blob/50ce0dfc8bcdc0e4e47a51f10c9f6fa9cbe53ff9/src/vs/platform/telemetry/common/errorTelemetry.ts#L91C6-L91C10
      // https://github.com/microsoft/vscode/blob/50ce0dfc8bcdc0e4e47a51f10c9f6fa9cbe53ff9/src/vs/workbench/api/browser/mainThreadDocuments.ts#L222
      () => undefined
    );
  if (barrelDocument === undefined) return;

  let barrelText = barrelDocument.getText();

  if (!barrelText.startsWith(_comment)) return;
  barrelText = barrelText.slice(_comment.length);

  let barrelSource = $ts.createSourceFile(``, barrelText, $ts.ScriptTarget.Latest);

  let stat = exists
           ? await $vscode.workspace.fs.stat($vscode.Uri.file(path))
           : undefined;
  let type = stat?.type;

  let changed: boolean;
  ({barrelSource, changed} = await update(name, path, type, barrelSource));

  if (!changed) return;

  barrelText = _printer.printFile(barrelSource);

  barrelText = _comment + barrelText;

  let edit = new $vscode.WorkspaceEdit();
  edit.replace($vscode.Uri.file(barrelPath), _rangeAll, barrelText);

  await $vscode.workspace.applyEdit(edit);
}