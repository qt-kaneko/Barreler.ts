import $vscode from "vscode";
import $path from "path";
import $ts from "typescript";

import * as factory from "./factory";

export async function update(name: string, path: string, type: $vscode.FileType | undefined, barrelSource: $ts.SourceFile)
{
  let barrelStatements = [...barrelSource.statements];

  let exportName = name.replace(/\.tsx?$/, ``);
  let exportPath = `./${exportName}`;

  let isDir = false;
  let hasExports = false;

  if (type !== undefined) // Exists
  {
    isDir = Boolean(type & $vscode.FileType.Directory);

    if (isDir)
    {
      path = $path.join(path, `index.ts`);
    }

    let document = await $vscode.workspace.openTextDocument(path);
    let text = document.getText();
    let source = $ts.createSourceFile(``, text, $ts.ScriptTarget.Latest);

    hasExports = source.statements.some(statement =>
      $ts.isExportDeclaration(statement) ||
      $ts.isExportAssignment(statement) ||
      $ts.getCombinedModifierFlags(statement as $ts.DeclarationStatement) & $ts.ModifierFlags.Export
    );
  }

  let barrelExportI = barrelStatements.findIndex(statement =>
    $ts.isExportDeclaration(statement) &&
    (statement.moduleSpecifier as $ts.StringLiteral).text === exportPath
  );

  if (hasExports && barrelExportI === -1)
  {
    let exportClause = isDir ? $ts.factory.createNamespaceExport($ts.factory.createStringLiteral(exportName)) : undefined;
    let exportDeclaration = factory.createExportDeclaration({
      isTypeOnly: false,
      exportClause: exportClause,
      moduleSpecifier: $ts.factory.createStringLiteral(exportPath)
    });

    barrelStatements.push(exportDeclaration);
  }
  else if (!hasExports && barrelExportI !== -1)
  {
    barrelStatements.splice(barrelExportI, 1);
  }
  else return {barrelSource, changed: false};

  barrelSource = $ts.factory.updateSourceFile(barrelSource, barrelStatements);

  return {barrelSource, changed: true};
}