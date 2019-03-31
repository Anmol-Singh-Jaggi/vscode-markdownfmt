import * as vscode from 'vscode';
import {provideMarkdownFormatting} from './formatting';

function getRangeOfDocument(document: vscode.TextDocument) : vscode.Range {
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    return new vscode.Range(start, end);
}

export function activate(context: vscode.ExtensionContext) {
    const supportedDocument: vscode.DocumentSelector = 'markdown';

    // Support formatting the whole document.
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(supportedDocument, {
        provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.TextEdit[] {
			const range = getRangeOfDocument(document);
			return provideMarkdownFormatting(document, range);
        }
    }));

    // Support formatting a selection.
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(supportedDocument, {
        provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.TextEdit[] {
			return provideMarkdownFormatting(document, range);
        }
    }));
}
