import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';


function runFormatter(text: string, filePath: string): string {
	let markdownfmtCommand: string = vscode.workspace.getConfiguration('markdownfmt')['command'];
	// Create a temporary file to store the current document text,
	// in case the formatter is executed without the file being saved.
	const tempDirPath = os.tmpdir();
	let tempFileName = 'markdownfmt_' + crypto.createHash('md5').update(filePath).digest('hex') + '.md';
	let tempFilePath = path.join(tempDirPath, tempFileName);
	let tempFileNamingAttempts = 10;
	// Make multiple limited attempts to find a unique temp file name.
	while (tempFileNamingAttempts-- && fs.existsSync(tempFilePath)) {
		tempFileName = tempFileName.replace('.md', `${tempFileNamingAttempts}.md`);
		tempFilePath = path.join(tempDirPath, tempFileName);
	}
	fs.writeFileSync(tempFilePath, text);
	markdownfmtCommand += ` "${tempFilePath}"`
	const processOutput = spawnSync(markdownfmtCommand, { shell: true });
	let result = text;
	if (processOutput.status !== 0) {
		let errorMsg: string = ""
		if (processOutput.error) {
			errorMsg += processOutput.error.message;
		}
		if (processOutput.stderr && processOutput.stderr.toString()) {
			if (errorMsg.length) {
				errorMsg += " || ";
			}
			errorMsg += processOutput.stderr.toString()
		}
		vscode.window.showErrorMessage(`Error while invoking markdownfmt: ${errorMsg}`)
	}
	else {
		result = processOutput.stdout.toString();
	}
	fs.unlinkSync(tempFilePath);
	return result;
}


export function provideMarkdownFormatting(document: vscode.TextDocument, range: vscode.Range) {
	const markdownfmtConfig = vscode.workspace.getConfiguration('markdownfmt')
	if (markdownfmtConfig && !markdownfmtConfig['disableFormatter']) {
		const content = document.getText(range);
		const formattedText: string = runFormatter(content, document.fileName);
		const textEdits: vscode.TextEdit[] = [new vscode.TextEdit(range, formattedText)]
		return textEdits;
	}
	return [];
}
