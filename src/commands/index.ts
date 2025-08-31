import { Editor, MarkdownView, Notice } from 'obsidian';
import { SampleModal } from '../modals/SampleModal';

/**
 * 命令管理器 - 负责注册和管理所有插件命令
 */
export class CommandManager {
	private app: any;
	private plugin: any;

	constructor(app: any, plugin: any) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * 注册所有命令
	 */
	registerCommands(): void {
		this.registerSimpleModalCommand();
		this.registerEditorCommand();
		this.registerComplexModalCommand();
	}

	/**
	 * 注册简单模态框命令
	 */
	private registerSimpleModalCommand(): void {
		this.plugin.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
	}

	/**
	 * 注册编辑器命令
	 */
	private registerEditorCommand(): void {
		this.plugin.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
	}

	/**
	 * 注册复杂模态框命令（带条件检查）
	 */
	private registerComplexModalCommand(): void {
		this.plugin.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// 检查条件
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// 如果 checking 为 true，我们只是在"检查"命令是否可以运行
					// 如果 checking 为 false，则执行实际操作
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// 只有当检查函数返回 true 时，此命令才会在命令面板中显示
					return true;
				}
			}
		});
	}
}