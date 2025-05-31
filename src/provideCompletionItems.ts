// Yes, this file is 99% the same as update.ts
// No, I will not do anything about it

import VSCODE from "vscode";
import PATH from "path";
import TS from "typescript";

import * as FACTORY from "./factory";
import { openTextDocument } from "./openTextDocument";

const _printer = TS.createPrinter();
const _comment = `// @auto-generated\n`;

export async function provideCompletionItems(document: VSCODE.TextDocument, position: VSCODE.Position, token: VSCODE.CancellationToken, context: VSCODE.CompletionContext)
{
  let barrelPath = document.uri.fsPath;
  let dir = PATH.dirname(barrelPath);

  let barrelStatements: TS.Statement[] = [];

  let uris = await VSCODE.workspace.fs.readDirectory(VSCODE.Uri.file(dir));
  for (let [name, type] of uris)
  {
    let path = PATH.join(dir, name);

    let isDir = type & VSCODE.FileType.Directory;
    if (isDir)
    {
      path = PATH.join(path, `index.ts`);
    }

    let document = await openTextDocument(path);
    if (document === undefined) continue;

    let text = document.getText();
    let source = TS.createSourceFile(path, text, TS.ScriptTarget.ESNext);

    let hasExports = source.statements.some(statement =>
      TS.isExportDeclaration(statement) ||
      TS.isExportAssignment(statement) ||
      TS.isDeclarationStatement(statement) && TS.getCombinedModifierFlags(statement) & TS.ModifierFlags.Export
    );

    if (hasExports)
    {
      let exportName = name.replace(/\.tsx?$/, ``);
      let exportPath = `./${exportName}`;

      let exportClause = isDir ? TS.factory.createNamespaceExport(TS.factory.createStringLiteral(exportName)) : undefined;
      let exportDeclaration = FACTORY.createExportDeclaration({
        isTypeOnly: false,
        exportClause: exportClause,
        moduleSpecifier: TS.factory.createStringLiteral(exportPath)
      });

      if (isDir) barrelStatements.push(exportDeclaration);
      else barrelStatements.unshift(exportDeclaration);
    }
  }

  let barrelSource = TS.factory.createSourceFile(
    barrelStatements,
    TS.factory.createToken(TS.SyntaxKind.EndOfFileToken),
    TS.NodeFlags.None
  );
  let barrelText = _printer.printFile(barrelSource);

  barrelText = _comment + barrelText;

  let completionItem = new VSCODE.CompletionItem(`auto-generated`, VSCODE.CompletionItemKind.Snippet);
  completionItem.insertText = barrelText;
  return [completionItem];
}