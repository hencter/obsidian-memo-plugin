import { App, PluginSettingTab, Setting } from 'obsidian';
import type { MemoPluginSettings } from '../types/settings';

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

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}