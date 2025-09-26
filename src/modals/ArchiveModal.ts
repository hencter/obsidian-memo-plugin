import { App, Modal, Setting, TFile, TFolder, Notice } from 'obsidian';
import type { MemoPluginSettings } from '../types/settings';
import { validateDirectoryPath } from '../types/settings';
import { FolderSuggest } from '../components/FolderSuggest';

/**
 * 归档模态框 - 用于配置归档路径和文件名
 */
export class ArchiveModal extends Modal {
    /** 要归档的文件 */
    private file: TFile;
    
    /** 插件设置 */
    private settings: MemoPluginSettings;
    
    /** 归档路径输入框 */
    private archivePathInput: HTMLInputElement;
    
    /** 文件名输入框 */
    private filenameInput: HTMLInputElement;
    
    /** 确认回调函数 */
    private onConfirm: (archivePath: string, filename: string) => Promise<void>;

    constructor(
        app: App, 
        file: TFile, 
        settings: MemoPluginSettings,
        onConfirm: (archivePath: string, filename: string) => Promise<void>
    ) {
        super(app);
        this.file = file;
        this.settings = settings;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 设置模态框标题
        contentEl.createEl("h2", { text: "归档备忘录" });

        // 显示要归档的文件信息
        const fileInfoEl = contentEl.createEl("div", { cls: "archive-file-info" });
        fileInfoEl.createEl("p", { 
            text: `正在归档: ${this.file.basename}`,
            cls: "archive-file-name"
        });

        // 创建归档路径设置
        this.createArchivePathSetting(contentEl);

        // 创建文件名设置
        this.createFilenameSetting(contentEl);

        // 创建按钮组
        this.createButtons(contentEl);

        // 自动聚焦到文件名输入框
        setTimeout(() => {
            this.filenameInput?.focus();
            this.filenameInput?.select();
        }, 100);
    }

    /**
     * 创建归档路径设置
     */
    private createArchivePathSetting(contentEl: HTMLElement): void {
        new Setting(contentEl)
            .setName('归档路径')
            .setDesc('选择归档文件的目标文件夹（支持搜索和自动补全）')
            .addSearch(search => {
                this.archivePathInput = search.inputEl;
                search.setPlaceholder('输入或搜索归档路径...')
                    .setValue(this.settings.archiveDirectory)
                    .onChange(async (value) => {
                        this.validatePath();
                    });
                
                // 设置文件夹搜索建议
                const commonFolders = [
                    this.settings.archiveDirectory,
                    this.settings.memosDirectory,
                    'Archive',
                    'Memos',
                    'Notes'
                ].filter(folder => folder);
                
                new FolderSuggest(this.app, search.inputEl, commonFolders);
                
                // 初始验证
                setTimeout(() => {
                    this.validatePath();
                }, 100);
            });
    }

    /**
     * 创建文件名设置
     */
    private createFilenameSetting(contentEl: HTMLElement): void {
        new Setting(contentEl)
            .setName("文件名")
            .setDesc("设置归档后的文件名（不包含扩展名）")
            .addText(text => {
                this.filenameInput = text.inputEl;
                text
                    .setPlaceholder(this.file.basename)
                    .setValue(this.file.basename)
                    .onChange((value) => {
                        // 验证文件名格式
                        if (this.isValidFilename(value)) {
                            text.inputEl.removeClass('is-invalid');
                            text.inputEl.title = '';
                        } else {
                            text.inputEl.addClass('is-invalid');
                            text.inputEl.title = '文件名包含无效字符';
                        }
                    });
                
                // 添加键盘事件监听
                text.inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleConfirm();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.close();
                    }
                });
                
                return text;
            });
    }

    /**
     * 创建按钮组
     */
    private createButtons(contentEl: HTMLElement): void {
        const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });

        // 取消按钮
        const cancelButton = buttonContainer.createEl("button", { 
            text: "取消",
            cls: "mod-cta"
        });
        cancelButton.addEventListener('click', () => {
            this.close();
        });

        // 确认按钮
        const confirmButton = buttonContainer.createEl("button", { 
            text: "归档",
            cls: "mod-cta mod-warning"
        });
        confirmButton.addEventListener('click', () => {
            this.handleConfirm();
        });
    }



    /**
     * 验证归档路径
     */
    private validatePath(): void {
        const value = this.archivePathInput.value;
        const validation = validateDirectoryPath(value);
        
        if (!validation.isValid && value.trim() !== '') {
            this.archivePathInput.addClass('is-invalid');
            this.archivePathInput.title = validation.errorMessage || '路径格式无效';
        } else {
            this.archivePathInput.removeClass('is-invalid');
            this.archivePathInput.title = '';
        }
    }

    /**
     * 验证文件名是否有效
     */
    private isValidFilename(filename: string): boolean {
        if (!filename.trim()) return false;
        
        // 检查非法字符
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(filename)) return false;
        
        // 检查保留名称
        const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        if (reservedNames.includes(filename.toUpperCase())) return false;
        
        return true;
    }

    /**
     * 处理确认操作
     */
    private async handleConfirm(): Promise<void> {
        const archivePath = this.archivePathInput.value.trim();
        const filename = this.filenameInput.value.trim();

        // 验证输入
        if (!archivePath) {
            new Notice("请输入归档路径");
            this.archivePathInput.focus();
            return;
        }

        if (!filename) {
            new Notice("请输入文件名");
            this.filenameInput.focus();
            return;
        }

        // 验证路径格式
        const pathValidation = validateDirectoryPath(archivePath);
        if (!pathValidation.isValid) {
            new Notice(`路径格式错误: ${pathValidation.errorMessage}`);
            this.archivePathInput.focus();
            return;
        }

        // 验证文件名格式
        if (!this.isValidFilename(filename)) {
            new Notice("文件名包含无效字符");
            this.filenameInput.focus();
            return;
        }

        try {
            // 调用确认回调
            await this.onConfirm(archivePath, filename);
            this.close();
        } catch (error) {
            console.error("归档操作失败:", error);
            new Notice("归档操作失败，请重试");
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}