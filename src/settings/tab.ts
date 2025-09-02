import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type { MemoPluginSettings } from '../types/settings';
import { validateDirectoryPath, validateIconName, validateMemoSectionHeaders } from '../types/settings';

/**
 * 插件设置页面组件
 */
export class MemoSettingTab extends PluginSettingTab {
	plugin: any; // 这里使用 any 类型，避免循环依赖

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// 基础设置 - 不添加标题，保持在顶部
		new Setting(containerEl)
			.setName('Memo directory')
			.setDesc('Directory where memo files will be stored')
			.addText(text => text
				.setPlaceholder('Memos')
				.setValue(this.plugin.settings.memosDirectory)
				.onChange(async (value) => {
					const validation = validateDirectoryPath(value);
					if (!validation.isValid) {
						new Notice(`Directory path error: ${validation.errorMessage}`);
						text.setValue(validation.correctedValue || 'Memos');
						this.plugin.settings.memosDirectory = validation.correctedValue || 'Memos';
					} else {
						this.plugin.settings.memosDirectory = value || 'Memos';
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Daily note directory')
			.setDesc('Directory where daily note files are stored')
			.addText(text => text
				.setPlaceholder('Daily Notes')
				.setValue(this.plugin.settings.dailyNoteDirectory)
				.onChange(async (value) => {
					const validation = validateDirectoryPath(value);
					if (!validation.isValid) {
						new Notice(`Directory path error: ${validation.errorMessage}`);
						text.setValue(validation.correctedValue || 'Daily Notes');
						this.plugin.settings.dailyNoteDirectory = validation.correctedValue || 'Daily Notes';
					} else {
						this.plugin.settings.dailyNoteDirectory = value || 'Daily Notes';
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-add to daily note')
			.setDesc('Automatically add memo links to today\'s daily note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoAddToDailyNote)
				.onChange(async (value) => {
					this.plugin.settings.autoAddToDailyNote = value;
					await this.plugin.saveSettings();
				}));

		// 界面设置部分
		new Setting(containerEl)
			.setName('Interface')
			.setHeading();



		new Setting(containerEl)
			.setName('View display name')
			.setDesc('Name displayed in the sidebar for the memo view')
			.addText(text => text
				.setPlaceholder('Memos')
				.setValue(this.plugin.settings.viewDisplayName)
				.onChange(async (value) => {
					this.plugin.settings.viewDisplayName = value || 'Memos';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('View icon')
			.setDesc('Icon name for the sidebar view (Lucide icon name, only lowercase letters, numbers and hyphens)')
			.addText(text => text
				.setPlaceholder('pencil')
				.setValue(this.plugin.settings.viewIcon)
				.onChange(async (value) => {
					const validation = validateIconName(value);
					if (!validation.isValid) {
						new Notice(`Icon name error: ${validation.errorMessage}`);
						text.setValue(validation.correctedValue || 'pencil');
						this.plugin.settings.viewIcon = validation.correctedValue || 'pencil';
					} else {
						this.plugin.settings.viewIcon = value || 'pencil';
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Editor placeholder')
			.setDesc('Placeholder text shown in the memo editor')
			.addText(text => text
				.setPlaceholder("What's on your mind?")
				.setValue(this.plugin.settings.editorPlaceholder)
				.onChange(async (value) => {
					this.plugin.settings.editorPlaceholder = value || "What's on your mind?";
					await this.plugin.saveSettings();
				}));

		// 格式设置部分
		new Setting(containerEl)
			.setName('Formatting')
			.setHeading();

		// 日记日期格式
		const dailyDateDesc = document.createDocumentFragment();
		dailyDateDesc.appendText('日记文件名的日期格式。查看所有可用的格式标记，请参考 ');
		dailyDateDesc.createEl('a', {
			text: '格式参考文档',
			attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
		});
		dailyDateDesc.createEl('br');
		dailyDateDesc.appendText('当前格式预览: ');
		const dailyDateSampleEl = dailyDateDesc.createEl('b', 'u-pop');
		new Setting(containerEl)
			.setName('日记日期格式')
			.setDesc(dailyDateDesc)
			.addMomentFormat(momentFormat => momentFormat
				.setValue(this.plugin.settings.dailyNoteDateFormat)
				.setSampleEl(dailyDateSampleEl)
				.setDefaultFormat('YYYY-MM-DD')
				.onChange(async (value) => {
					this.plugin.settings.dailyNoteDateFormat = value;
					await this.plugin.saveSettings();
				}));

		// 时间戳格式
		const timestampDesc = document.createDocumentFragment();
		timestampDesc.appendText('备忘录文件名的时间戳格式。查看所有可用的格式标记，请参考 ');
		timestampDesc.createEl('a', {
			text: '格式参考文档',
			attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
		});
		timestampDesc.createEl('br');
		timestampDesc.appendText('当前格式预览: ');
		const timestampSampleEl = timestampDesc.createEl('b', 'u-pop');
		new Setting(containerEl)
			.setName('时间戳格式')
			.setDesc(timestampDesc)
			.addMomentFormat(momentFormat => momentFormat
				.setValue(this.plugin.settings.timestampFormat)
				.setSampleEl(timestampSampleEl)
				.setDefaultFormat('YYYYMMDDHHmm')
				.onChange(async (value) => {
					this.plugin.settings.timestampFormat = value;
					await this.plugin.saveSettings();
				}));

		// 模板设置部分
		new Setting(containerEl)
			.setName('Templates')
			.setHeading();

		new Setting(containerEl)
			.setName('Daily note template')
			.setDesc('Template used when creating new daily notes. Use {{date}} as date placeholder.')
			.addTextArea(text => {
				const textArea = text
					.setPlaceholder('# {{date}}\n\n## 📝 Memos\n\n## 📅 Today\'s plan\n\n## 🎯 Completed\n\n## 💭 Thoughts\n\n')
					.setValue(this.plugin.settings.dailyNoteTemplate)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteTemplate = value;
						await this.plugin.saveSettings();
					});
				// 设置文本区域样式
				textArea.inputEl.rows = 6;
				textArea.inputEl.style.fontFamily = 'var(--font-monospace)';
				return textArea;
			})

		// 高级设置部分
		new Setting(containerEl)
			.setName('Advanced')
			.setHeading();

		new Setting(containerEl)
			.setName('Memo section headers')
			.setDesc('Headers used to identify memo sections in daily notes (comma-separated, at least one valid header required)')
			.addTextArea(text => {
				const textArea = text
					.setPlaceholder('## 📝 Memos,## Memos,## 备忘录')
					.setValue(this.plugin.settings.memoSectionHeaders.join(','))
					.onChange(async (value) => {
						const headers = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
						const validation = validateMemoSectionHeaders(headers);
						if (!validation.isValid) {
							new Notice(`Memo section headers error: ${validation.errorMessage}`);
							const correctedHeaders = validation.correctedValue || ['## 📝 Memos', '## Memos', '## 备忘录'];
							text.setValue(correctedHeaders.join(','));
							this.plugin.settings.memoSectionHeaders = correctedHeaders;
						} else {
							this.plugin.settings.memoSectionHeaders = validation.correctedValue || headers;
						}
						await this.plugin.saveSettings();
					});
				// 设置较小的文本区域
				textArea.inputEl.rows = 3;
				return textArea;
			});
	}
}