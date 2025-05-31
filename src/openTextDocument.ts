import VSCODE from "vscode";

export function openTextDocument(
  path: string,
  options?: {readonly encoding?: string}
)
: PromiseLike<VSCODE.TextDocument | undefined>
{
  return VSCODE.workspace
    .openTextDocument(path, options)
    .then(
      (value) => value,
      // Bruh, exact error is lost :(
      // https://github.com/microsoft/vscode/blob/50ce0dfc8bcdc0e4e47a51f10c9f6fa9cbe53ff9/src/vs/platform/telemetry/common/errorTelemetry.ts#L91C6-L91C10
      // https://github.com/microsoft/vscode/blob/50ce0dfc8bcdc0e4e47a51f10c9f6fa9cbe53ff9/src/vs/workbench/api/browser/mainThreadDocuments.ts#L222
      () => undefined
    );
}