import * as vscode from 'vscode';

let applying = false;

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
		if (applying) {
			return;
		}

		const edit = new vscode.WorkspaceEdit();
		let changed = false;

		for (const change of event.contentChanges) {
			if (!change.text.includes('§')) {
				continue;
			}

			const start = change.range.start;
			const end = event.document.positionAt(
				event.document.offsetAt(start) + change.text.length
			);

			edit.replace(
				event.document.uri,
				new vscode.Range(start, end),
				change.text.split('§').join('std::')
			);
			changed = true;
		}

		if (!changed) {
			return;
		}

		applying = true;
		vscode.workspace.applyEdit(edit).then(() => {
			applying = false;
		}, () => {
			applying = false;
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}