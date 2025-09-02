import { App, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { MemoPluginSettings, DEFAULT_SETTINGS, mergeSettings, validateSettings } from './src/types/settings';
import { MemoSettingTab } from './src/settings/tab';
import { CommandManager } from './src/commands/index';
import { MEMOS_VIEW_TYPE as VIEW_TYPE_MEMOS, MemosView } from 'src/views/MemosView';

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

		this.registerView(
			VIEW_TYPE_MEMOS,
			(leaf) => new MemosView(leaf, this.settings)
		);

		const ribbonIconEl = this.addRibbonIcon('dice', 'Memo Plugin', (evt: MouseEvent) => {
			new Notice('Memo Plugin activated!');
			this.activateMemosView();
		});
		ribbonIconEl.addClass('memo-plugin-ribbon-class');

		// 添加状态栏项目（移动端不可用）
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Memo Ready');
	}

	async activateMemosView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MEMOS);

		if (leaves.length > 0) {
			// 如果已存在我们的视图，直接使用
			leaf = leaves[0];
		} else {
			// 在主视图中创建新的 leaf（标签页）
			leaf = workspace.getLeaf(true);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_MEMOS, active: true });
			}
		}

		// 激活并显示 leaf
		if (leaf) {
			workspace.setActiveLeaf(leaf);
		}
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

	/**
	 * 加载插件设置
	 * 使用深度合并确保嵌套属性正确处理
	 */
	async loadSettings() {
		const loadedData = await this.loadData() || {};
		
		// 验证加载的设置
		if (loadedData) {
			const validation = validateSettings(loadedData);
			if (!validation.isValid) {
				console.warn('Memo Plugin: Settings validation errors:', validation.errors);
				// 显示验证错误通知
				if (validation.errors.length > 0) {
					new Notice(`设置验证错误已自动修正: ${validation.errors.join(', ')}`, 5000);
				}
			}
		}
		
		this.settings = mergeSettings(DEFAULT_SETTINGS, loadedData);
	}

	/**
	 * 保存插件设置
	 */

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
