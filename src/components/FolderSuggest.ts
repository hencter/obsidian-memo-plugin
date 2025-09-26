import { AbstractInputSuggest, App, TFolder } from 'obsidian';

/**
 * 文件夹搜索建议组件
 * 继承 Obsidian 官方的 AbstractInputSuggest 类
 */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    private commonFolders: string[];
    private inputElement: HTMLInputElement;

    constructor(
        app: App, 
        inputEl: HTMLInputElement,
        commonFolders: string[] = []
    ) {
        super(app, inputEl);
        this.commonFolders = commonFolders;
        this.inputElement = inputEl;
    }

    /**
     * 获取所有文件夹建议
     */
    getSuggestions(query: string): TFolder[] {
        const allFolders = this.getAllFolders();
        
        if (!query.trim()) {
            // 没有查询时，优先显示常用文件夹
            const commonFolderObjects = this.commonFolders
                .map(path => this.getFolderByPath(path))
                .filter(folder => folder !== null) as TFolder[];
            
            const otherFolders = allFolders
                .filter(folder => !this.commonFolders.includes(folder.path))
                .slice(0, 8);
            
            return [...commonFolderObjects, ...otherFolders].slice(0, 10);
        }

        // 智能匹配：优先匹配开头，然后匹配包含
        const lowerQuery = query.toLowerCase();
        const startsWith = allFolders.filter(folder => 
            folder.path.toLowerCase().startsWith(lowerQuery) ||
            folder.name.toLowerCase().startsWith(lowerQuery)
        );
        
        const contains = allFolders.filter(folder => 
            !folder.path.toLowerCase().startsWith(lowerQuery) &&
            !folder.name.toLowerCase().startsWith(lowerQuery) &&
            (folder.path.toLowerCase().includes(lowerQuery) ||
             folder.name.toLowerCase().includes(lowerQuery))
        );
        
        return [...startsWith, ...contains].slice(0, 10);
    }

    /**
     * 渲染建议项
     */
    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.createEl('div', { 
            text: folder.path,
            cls: 'folder-suggest-item'
        });
        
    }

    /**
     * 选择建议项时的回调
     */
    selectSuggestion(folder: TFolder, evt: MouseEvent | KeyboardEvent): void {
        this.inputElement.value = folder.path;
        this.inputElement.dispatchEvent(new Event('input'));
        this.close();
    }

    /**
     * 获取所有文件夹
     */
    private getAllFolders(): TFolder[] {
        const folders: TFolder[] = [];
        
        const addFoldersRecursively = (folder: TFolder) => {
            folders.push(folder);
            folder.children.forEach(child => {
                if (child instanceof TFolder) {
                    addFoldersRecursively(child);
                }
            });
        };

        // 从根目录开始遍历
        this.app.vault.getAllLoadedFiles().forEach(file => {
            if (file instanceof TFolder && file.parent === this.app.vault.getRoot()) {
                addFoldersRecursively(file);
            }
        });

        return folders.sort((a, b) => a.path.localeCompare(b.path));
    }

    /**
     * 根据路径获取文件夹对象
     */
    private getFolderByPath(path: string): TFolder | null {
        const file = this.app.vault.getAbstractFileByPath(path);
        return file instanceof TFolder ? file : null;
    }
}