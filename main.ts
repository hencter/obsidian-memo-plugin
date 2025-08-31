import { App, Notice, Plugin } from 'obsidian';
import { MemoPluginSettings, DEFAULT_SETTINGS } from './src/types/settings';
import { MemoSettingTab } from './src/settings/SettingTab';
import { CommandManager } from './src/commands/index';

export default class MemoPlugin extends Plugin {
	settings: MemoPluginSettings;
	private commandManager: CommandManager;

	async onload() {
		await this.loadSettings();

		// 初始化命令管理器
		this.commandManager = new CommandManager(this.app, this);

		// 设置 UI 组件
		this.setupUI();

		// 注册命令
		this.commandManager.registerCommands();

		// 添加设置页面
		this.addSettingTab(new MemoSettingTab(this.app, this));

		// 注册事件监听器
		this.registerEventListeners();
	}

	/**
	 * 设置用户界面组件
	 */
	private setupUI(): void {
		// 创建左侧功能区图标
		const ribbonIconEl = this.addRibbonIcon('dice', 'Memo Plugin', (evt: MouseEvent) => {
			new Notice('Memo Plugin activated!');
		});
		ribbonIconEl.addClass('memo-plugin-ribbon-class');

		// 添加状态栏项目（移动端不可用）
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Memo Ready');
	}

	/**
	 * 注册事件监听器
	 */
	private registerEventListeners(): void {
		// 注册全局 DOM 事件（插件禁用时会自动移除）
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('memo plugin: click event', evt);
		});

		// 注册定时器（插件禁用时会自动清除）
		this.registerInterval(window.setInterval(() => {
			console.log('memo plugin: interval check');
		}, 5 * 60 * 1000));
	}

	onunload() {
		// 清理资源
		console.log('Memo Plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
