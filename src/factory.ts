import TS from "typescript";

export function createExportDeclaration({
  modifiers,
  isTypeOnly,
  exportClause,
  moduleSpecifier,
  attributes
}: {
  modifiers?: readonly TS.ModifierLike[],
  isTypeOnly: boolean,
  exportClause?: TS.NamedExportBindings,
  moduleSpecifier?: TS.Expression,
  attributes?: TS.ImportAttributes
})
{
  return TS.factory.createExportDeclaration(
    modifiers,
    isTypeOnly,
    exportClause,
    moduleSpecifier,
    attributes
  );
}