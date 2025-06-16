import $ts from "typescript";

export function createExportDeclaration({
  modifiers,
  isTypeOnly,
  exportClause,
  moduleSpecifier,
  attributes
}: {
  modifiers?: readonly $ts.ModifierLike[],
  isTypeOnly: boolean,
  exportClause?: $ts.NamedExportBindings,
  moduleSpecifier?: $ts.Expression,
  attributes?: $ts.ImportAttributes
})
{
  return $ts.factory.createExportDeclaration(
    modifiers,
    isTypeOnly,
    exportClause,
    moduleSpecifier,
    attributes
  );
}