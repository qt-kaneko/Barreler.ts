import PATH from "path";
import TS from "typescript";
import VSCODE from "vscode";

import * as FACTORY from "./factory";
import { openTextDocument } from "./openTextDocument";

const _printer = TS.createPrinter();
const _rangeAll = new VSCODE.Range(0, 0, Number.MAX_SAFE_INTEGER, 0);
const _comment = `// @auto-generated\n`;

export async function update(path: string, exists: boolean)
{
  let dir = PATH.dirname(path);
  let name = PATH.basename(path);

  if (name === `index.ts`) // If index.ts, treat as directory
  {
    return await update(dir, exists);
  }

  let barrelPath = PATH.join(dir, `index.ts`);

  let barrelDocument = await openTextDocument(barrelPath);
  if (barrelDocument === undefined) return;

  let barrelText = barrelDocument.getText();
  if (!barrelText.startsWith(_comment)) return;

  barrelText = barrelText.slice(_comment.length);

  let barrelSource = TS.createSourceFile(barrelPath, barrelText, TS.ScriptTarget.ESNext);

  let exportName = name.replace(/\.tsx?$/, ``);
  let exportPath = `./${exportName}`;

  // Remove export declaration
  let barrelStatements = barrelSource.statements
    .filter(TS.isExportDeclaration)
    .filter(statement => (statement.moduleSpecifier as TS.StringLiteral)?.text !== exportPath);

  if (exists)
  {
    let stat = await VSCODE.workspace.fs.stat(VSCODE.Uri.file(path));
    let isDir = stat.type & VSCODE.FileType.Directory;

    if (isDir)
    {
      path = PATH.join(path, `index.ts`);
    }

    let document = await openTextDocument(path);
    if (document === undefined) return;

    let text = document.getText();
    let source = TS.createSourceFile(path, text, TS.ScriptTarget.ESNext);

    let hasExports = source.statements.some(statement =>
      TS.isExportDeclaration(statement) ||
      TS.isExportAssignment(statement) ||
      TS.getCombinedModifierFlags(statement as TS.DeclarationStatement) & TS.ModifierFlags.Export
    );

    if (hasExports)
    {
      let exportClause = isDir ? TS.factory.createNamespaceExport(TS.factory.createStringLiteral(exportName)) : undefined;
      let exportDeclaration = FACTORY.createExportDeclaration({
        isTypeOnly: false,
        exportClause: exportClause,
        moduleSpecifier: TS.factory.createStringLiteral(exportPath)
      });

      // Add export declaration
      if (isDir) barrelStatements.push(exportDeclaration);
      else barrelStatements.unshift(exportDeclaration);
    }
  }

  barrelSource = TS.factory.updateSourceFile(barrelSource, barrelStatements);
  barrelText = _printer.printFile(barrelSource);

  barrelText = _comment + barrelText;

  let edit = new VSCODE.WorkspaceEdit();
  edit.replace(VSCODE.Uri.file(barrelPath), _rangeAll, barrelText);

  await VSCODE.workspace.applyEdit(edit);
}