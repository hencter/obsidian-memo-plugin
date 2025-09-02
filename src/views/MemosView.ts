
import {
    ItemView,
    WorkspaceLeaf,
    TFile,
    Notice,
    MarkdownRenderer,
    moment,
    Menu,
    stringifyYaml
} from "obsidian";
import { EditorView, keymap, highlightActiveLine, highlightActiveLineGutter, dropCursor, rectangularSelection, crosshairCursor } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from "@codemirror/language";

// 常量定义
export const MEMOS_VIEW_TYPE = "memos-view";
const MEMOS_DIR = "Memos";

// 自定义基础设置（不包含行号）
const customBasicSetup: Extension = [
    history(),
    foldGutter(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
    ])
];

/**
 * Memos视图类 - 提供备忘录的创建、编辑和管理功能
 * 
 * 主要功能：
 * - 创建新的备忘录
 * - 显示备忘录列表
 * - 编辑现有备忘录
 * - 自动添加到日记
 */
export class MemosView extends ItemView {
    /** 主编辑器文本区域 */
    private editorEl: HTMLTextAreaElement;
    private codeMirrorView: EditorView | null = null;

    /** 备忘录列表容器 */
    private memosContainer: HTMLDivElement;

    /**
     * 构造函数
     * @param leaf 工作区叶子节点
     */
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    /**
     * 获取视图类型
     * @returns 视图类型标识符
     */
    getViewType(): string {
        return MEMOS_VIEW_TYPE;
    }

    /**
     * 获取显示文本
     * @returns 视图显示名称
     */
    getDisplayText(): string {
        return "Memos";
    }

    /**
     * 获取视图图标
     * @returns 图标名称
     */
    getIcon(): string {
        return "pencil";
    }

    /**
     * 视图打开时的初始化方法
     * 创建编辑器界面和备忘录列表
     */
    async onOpen(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass("memos-view-container");

        // 创建输入表单区域
        this.createInputForm(container);

        // 创建备忘录列表容器
        this.memosContainer = container.createEl("div", { cls: "memos-list" });

        // 初始渲染备忘录列表
        await this.renderMemos();
    }

    /**
     * 创建输入表单界面
     * @param container 父容器元素
     */
    private createInputForm(container: Element): void {
        const formEl = container.createEl("div", { cls: "memos-form" });

        // 创建 CodeMirror 编辑器容器
        const editorContainer = formEl.createEl("div", {
            cls: "memos-editor-container"
        });

        // 创建 CodeMirror 编辑器
        this.createCodeMirrorEditor(editorContainer);

        // 创建按钮容器和保存按钮
        const buttonContainer = formEl.createEl("div", { cls: "memos-button-container" });
        const saveButton = buttonContainer.createEl("button", {
            text: "Save", // 移除快捷键提示
            cls: "mod-cta"
        });

        // 注册保存按钮事件
        this.registerDomEvent(saveButton, 'click', this.handleSave.bind(this));
    }

    /**
     * 创建 CodeMirror 编辑器
     * @param container 编辑器容器元素
     */
    private createCodeMirrorEditor(container: HTMLElement): void {
        // 创建编辑器状态
        const state = EditorState.create({
            doc: "",
            extensions: [
                customBasicSetup,
                markdown(),
                EditorView.theme({
                    "&": {
                        fontSize: "var(--font-ui-medium)",
                        fontFamily: "var(--font-text)",
                        minHeight: "100px",
                        maxHeight: "300px",
                        backgroundColor: "var(--background-primary)",
                        color: "var(--text-normal)"
                    },
                    ".cm-content": {
                        padding: "var(--size-4-3)",
                        minHeight: "100px",
                        backgroundColor: "transparent",
                        color: "var(--text-normal)",
                        lineHeight: "var(--line-height-normal)",
                        caretColor: "var(--text-accent)"
                    },
                    ".cm-focused": {
                        outline: "none"
                    },
                    ".cm-editor": {
                        borderRadius: "var(--radius-m)",
                        border: "1px solid var(--background-modifier-border)",
                        backgroundColor: "var(--background-primary)",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                    },
                    ".cm-editor.cm-focused": {
                        borderColor: "var(--interactive-accent)",
                        boxShadow: "0 0 0 2px var(--interactive-accent-hover)"
                    },
                    ".cm-cursor": {
                        borderLeftColor: "var(--text-accent)",
                        borderLeftWidth: "2px"
                    },
                    ".cm-selectionBackground": {
                        backgroundColor: "var(--text-selection) !important"
                    },
                    ".cm-activeLine": {
                        backgroundColor: "var(--background-primary-alt)"
                    },
                    ".cm-foldGutter": {
                        backgroundColor: "var(--background-secondary)",
                        borderRight: "1px solid var(--background-modifier-border)",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-ui-smaller)"
                    },
                    ".cm-placeholder": {
                        color: "var(--text-muted)",
                        fontStyle: "italic"
                    }
                }),
                EditorView.lineWrapping
                // 移除快捷键支持
            ]
        });

        // 创建编辑器视图
        this.codeMirrorView = new EditorView({
            state,
            parent: container
        });

        // 设置占位符文本
        this.codeMirrorView.dom.setAttribute('data-placeholder', "What's on your mind?");
    }

    /**
     * 处理保存备忘录的操作
     * 创建新的备忘录文件并添加到日记中
     */
    private async handleSave(): Promise<void> {
        if (!this.codeMirrorView) {
            new Notice("编辑器未初始化");
            return;
        }

        const rawContent = this.codeMirrorView.state.doc.toString();

        // 验证输入内容
        if (!rawContent || rawContent.trim().length === 0) {
            new Notice("请输入备忘录内容");
            return;
        }

        try {
            // 确保备忘录目录存在
            await this.ensureMemosDirectory();

            // 生成文件信息
            const now = moment();
            const timestamp = now.format("YYYYMMDDHHmm");
            const filePath = `${MEMOS_DIR}/${timestamp}.md`;

            // 解析内容并创建文件
            const fileBody = this.parseContentToMarkdown(rawContent);
            const newMemoFile = await this.app.vault.create(filePath, fileBody);

            // 添加frontmatter元数据
            await this.addFrontmatterToMemo(newMemoFile, now);

            // 添加到日记
            await this.appendToDailyNote(newMemoFile);

            // 清空编辑器并刷新列表
            this.codeMirrorView.dispatch({
                changes: {
                    from: 0,
                    to: this.codeMirrorView.state.doc.length,
                    insert: ""
                }
            });
            await this.renderMemos();

            new Notice("备忘录已保存");

        } catch (error) {
            console.error("保存备忘录时出错:", error);
            new Notice("保存备忘录失败，请重试");
        }
    }

    /**
     * 确保备忘录目录存在
     */
    private async ensureMemosDirectory(): Promise<void> {
        try {
            await this.app.vault.createFolder(MEMOS_DIR);
        } catch (e) {
            // 目录已存在时忽略错误
        }
    }

    /**
     * 解析内容为Markdown格式
     * @param rawContent 原始输入内容
     * @returns 格式化的Markdown内容
     */
    private parseContentToMarkdown(rawContent: string): string {
        // 直接返回原始内容，不进行额外的格式化处理
        // 用户输入什么就保存什么，保持原样
        return rawContent.trim();
    }

    /**
     * 为备忘录添加frontmatter元数据
     * @param file 备忘录文件
     * @param timestamp 时间戳
     */
    private async addFrontmatterToMemo(file: TFile, timestamp: moment.Moment): Promise<void> {
        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            frontmatter.id = timestamp.format("YYYYMMDDHHmm");
            frontmatter.date = timestamp.format();
            frontmatter.createdAt = timestamp.format();
            frontmatter.updatedAt = timestamp.format();
            frontmatter.tags = frontmatter.tags || [];
        });
    }

    /**
     * 将备忘录链接添加到当日的日记中
     * @param memoFile 备忘录文件
     */
    private async appendToDailyNote(memoFile: TFile): Promise<void> {
        try {
            const today = moment().format("YYYY-MM-DD");
            const dailyNotePath = `Daily Notes/${today}.md`;

            // 获取或创建日记文件
            const dailyNote = await this.getOrCreateDailyNote(dailyNotePath, today);

            if (dailyNote) {
                await this.addMemoLinkToDailyNote(dailyNote, memoFile);
            }

        } catch (error) {
            console.error("添加到日记时出错:", error);
            // 不阻止备忘录创建，只记录错误
        }
    }

    /**
     * 获取或创建日记文件
     * @param dailyNotePath 日记文件路径
     * @param today 今天的日期字符串
     * @returns 日记文件或null
     */
    private async getOrCreateDailyNote(dailyNotePath: string, today: string): Promise<TFile | null> {
        try {
            // 尝试获取现有的日记文件
            const existingFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
            if (existingFile instanceof TFile) {
                return existingFile;
            }
        } catch (e) {
            // 文件不存在，需要创建
        }

        // 创建新的日记文件
        return await this.createNewDailyNote(dailyNotePath, today);
    }

    /**
     * 创建新的日记文件
     * @param dailyNotePath 日记文件路径
     * @param today 今天的日期字符串
     * @returns 新创建的日记文件
     */
    private async createNewDailyNote(dailyNotePath: string, today: string): Promise<TFile> {
        try {
            // 确保Daily Notes目录存在
            await this.app.vault.createFolder("Daily Notes");
        } catch (e) {
            // 目录已存在时忽略错误
        }

        // 创建日记文件的初始内容
        const dailyNoteContent = this.createDailyNoteTemplate(today);
        return await this.app.vault.create(dailyNotePath, dailyNoteContent);
    }

    /**
     * 创建日记文件模板
     * @param today 今天的日期字符串
     * @returns 日记文件的初始内容
     */
    private createDailyNoteTemplate(today: string): string {
        return `# ${today}\n\n## 📝 备忘录\n\n## 📅 今日计划\n\n## 🎯 完成事项\n\n## 💭 思考记录\n\n`;
    }

    /**
     * 将备忘录链接添加到日记文件中
     * @param dailyNote 日记文件
     * @param memoFile 备忘录文件
     */
    private async addMemoLinkToDailyNote(dailyNote: TFile, memoFile: TFile): Promise<void> {
        const content = await this.app.vault.read(dailyNote);
        const memoLink = `- [[${memoFile.basename}]]`;

        // 检查链接是否已存在
        if (content.includes(memoLink)) {
            return; // 链接已存在，无需重复添加
        }

        // 添加备忘录链接到适当的位置
        const newContent = this.insertMemoLinkIntoContent(content, memoLink);
        await this.app.vault.modify(dailyNote, newContent);
    }

    /**
     * 将备忘录链接插入到日记内容的适当位置
     * @param content 现有的日记内容
     * @param memoLink 备忘录链接
     * @returns 更新后的内容
     */
    private insertMemoLinkIntoContent(content: string, memoLink: string): string {
        const memoSectionHeaders = ["## 📝 备忘录", "## Memos", "## 备忘录"];

        // 查找备忘录部分
        for (const header of memoSectionHeaders) {
            if (content.includes(header)) {
                // 在现有备忘录部分添加链接
                const headerIndex = content.indexOf(header);
                const nextSectionIndex = content.indexOf("\n## ", headerIndex + header.length);

                if (nextSectionIndex === -1) {
                    // 备忘录部分是最后一个部分
                    return content + `\n${memoLink}`;
                } else {
                    // 在下一个部分之前插入
                    return content.slice(0, nextSectionIndex) +
                        `\n${memoLink}` +
                        content.slice(nextSectionIndex);
                }
            }
        }

        // 如果没有找到备忘录部分，在文件末尾添加新的部分
        return `${content}\n\n## 📝 备忘录\n\n${memoLink}\n`;
    }

    /**
     * 渲染备忘录列表
     * 获取所有备忘录文件并按修改时间排序显示
     */
    private async renderMemos(): Promise<void> {
        this.memosContainer.empty();

        try {
            // 获取并过滤备忘录文件
            const memoFiles = this.getMemoFiles();

            // 按修改时间排序（最新的在前）
            const sortedFiles = await this.sortFilesByModTime(memoFiles);

            // 渲染每个备忘录
            for (const file of sortedFiles) {
                const memoEl = this.memosContainer.createEl("div", { cls: "memo-item" });

                // 添加双击事件监听器，双击进入编辑状态
                this.registerDomEvent(memoEl, 'dblclick', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.renderMemoEditView(file, memoEl);
                });

                await this.renderMemoReadView(file, memoEl);
            }

        } catch (error) {
            console.error("渲染备忘录列表时出错:", error);
            this.memosContainer.createEl("div", {
                text: "加载备忘录时出错，请刷新重试",
                cls: "memos-error"
            });
        }
    }

    /**
     * 获取所有备忘录文件
     * @returns 备忘录文件数组
     */
    private getMemoFiles(): TFile[] {
        return this.app.vault.getMarkdownFiles()
            .filter(file => file.path.startsWith(MEMOS_DIR + "/"));
    }

    /**
     * 按修改时间对文件进行排序
     * @param files 文件数组
     * @returns 排序后的文件数组
     */
    private async sortFilesByModTime(files: TFile[]): Promise<TFile[]> {
        const filesWithTime = await Promise.all(
            files.map(async (file) => {
                try {
                    const stat = await this.app.vault.adapter.stat(file.path);
                    return {
                        file,
                        mtime: stat?.mtime || 0
                    };
                } catch (error) {
                    console.warn(`获取文件 ${file.path} 的状态信息失败:`, error);
                    return {
                        file,
                        mtime: 0
                    };
                }
            })
        );

        return filesWithTime
            .sort((a, b) => b.mtime - a.mtime)
            .map(item => item.file);
    }

    /**
     * 渲染备忘录的阅读视图
     * @param file 备忘录文件
     * @param container 容器元素
     */
    private async renderMemoReadView(file: TFile, container: HTMLDivElement): Promise<void> {
        try {
            container.empty();

            // 创建头部区域和菜单
            this.createMemoHeader(file, container);

            // 创建内容区域
            await this.createMemoContent(file, container);

        } catch (error) {
            console.error(`渲染备忘录 ${file.path} 时出错:`, error);
            container.createEl("div", {
                text: "加载备忘录内容失败",
                cls: "memo-error"
            });
        }
    }

    /**
     * 创建备忘录头部区域和菜单
     * @param file 备忘录文件
     * @param container 容器元素
     */
    private createMemoHeader(file: TFile, container: HTMLDivElement): void {
        const menuButton = container.createEl("button", {
            cls: "memo-menu-button",
            text: "...",
            attr: { "aria-label": "备忘录菜单" }
        });

        // 注册菜单按钮点击事件
        this.registerDomEvent(menuButton, 'click', (event) => {
            const menu = new Menu();

            // 添加编辑选项
            menu.addItem((item) =>
                item
                    .setTitle("编辑")
                    .setIcon("pencil")
                    .onClick(() => {
                        this.renderMemoEditView(file, container);
                    })
            );

            // 添加删除选项
            menu.addItem((item) =>
                item
                    .setTitle("删除")
                    .setIcon("trash")
                    .onClick(async () => {
                        await this.handleDeleteMemo(file);
                    })
            );

            menu.showAtMouseEvent(event);
        });
    }

    /**
     * 创建备忘录内容区域
     * @param file 备忘录文件
     * @param container 容器元素
     */
    private async createMemoContent(file: TFile, container: HTMLDivElement): Promise<void> {
        const contentEl = container.createEl("div", { cls: "memo-content" });
        await MarkdownRenderer.render(this.app, `![[${file.path}]]`, contentEl, file.path, this);
    }

    /**
     * 处理删除备忘录操作
     * @param file 要删除的备忘录文件
     */
    private async handleDeleteMemo(file: TFile): Promise<void> {
        try {
            const confirmed = await this.showDeleteConfirmation(file.basename);
            if (confirmed) {
                await this.app.vault.delete(file);
                await this.renderMemos();
                new Notice("备忘录已删除");
            }
        } catch (error) {
            console.error(`删除备忘录 ${file.path} 时出错:`, error);
            new Notice("删除备忘录失败，请重试");
        }
    }

    /**
     * 显示删除确认对话框
     * @param fileName 文件名
     * @returns 是否确认删除
     */
    private async showDeleteConfirmation(fileName: string): Promise<boolean> {
        return new Promise((resolve) => {
            const confirmed = confirm(`确定要删除备忘录 "${fileName}" 吗？此操作无法撤销。`);
            resolve(confirmed);
        });
    }

    /**
     * 渲染备忘录的编辑视图
     * @param file 备忘录文件
     * @param container 容器元素
     */
    private async renderMemoEditView(file: TFile, container: HTMLDivElement): Promise<void> {
        try {
            container.empty();
            container.addClass("is-editing");

            const fileContent = await this.app.vault.read(file);
            const fileCache = this.app.metadataCache.getFileCache(file);

            // 提取正文内容（排除frontmatter）
            const bodyContent = this.extractBodyContent(fileContent, fileCache);

            // 创建编辑界面
            this.createEditInterface(file, container, bodyContent, fileCache);

        } catch (error) {
            console.error(`渲染编辑视图时出错:`, error);
            container.createEl("div", {
                text: "加载编辑器失败，请重试",
                cls: "memo-error"
            });
        }
    }

    /**
     * 提取文件的正文内容（排除frontmatter）
     * @param fileContent 完整文件内容
     * @param fileCache 文件缓存信息
     * @returns 正文内容
     */
    private extractBodyContent(fileContent: string, fileCache: any): string {
        let bodyContent = fileContent;

        if (fileCache?.frontmatter?.position?.end) {
            // 从frontmatter结束位置之后开始提取内容
            bodyContent = fileContent.slice(fileCache.frontmatter.position.end.offset).trim();
        } else if (fileContent.startsWith('---')) {
            // 如果缓存信息不可用，手动解析frontmatter
            const lines = fileContent.split('\n');
            let endIndex = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '---') {
                    endIndex = i;
                    break;
                }
            }
            if (endIndex > 0) {
                bodyContent = lines.slice(endIndex + 1).join('\n').trim();
            }
        }

        return bodyContent;
    }

    /**
     * 创建编辑界面
     * @param file 备忘录文件
     * @param container 容器元素
     * @param bodyContent 正文内容
     * @param fileCache 文件缓存信息
     */
    private createEditInterface(
        file: TFile,
        container: HTMLDivElement,
        bodyContent: string,
        fileCache: any
    ): void {
        // 创建 CodeMirror 编辑器容器
        const editorContainer = container.createEl("div", {
            cls: "memos-editor-container memo-edit-container"
        });

        // 创建编辑模式的 CodeMirror 编辑器
        const editCodeMirrorView = this.createEditCodeMirrorEditor(editorContainer, bodyContent);

        // 创建按钮组
        const buttonGroup = container.createEl("div", { cls: "memo-edit-buttons" });

        // 创建保存和取消按钮
        this.createEditButtons(file, container, editCodeMirrorView, buttonGroup, fileCache);

        // 自动聚焦到编辑器
        editCodeMirrorView.focus();

        // 将光标移动到内容末尾
        const doc = editCodeMirrorView.state.doc;
        editCodeMirrorView.dispatch({
            selection: { anchor: doc.length, head: doc.length }
        });
    }

    /**
     * 创建编辑模式的 CodeMirror 编辑器
     * @param container 编辑器容器元素
     * @param initialContent 初始内容
     * @returns CodeMirror 编辑器视图
     */
    private createEditCodeMirrorEditor(container: HTMLElement, initialContent: string): EditorView {
        // 创建编辑器状态
        const state = EditorState.create({
            doc: initialContent,
            extensions: [
                customBasicSetup,
                markdown(),
                EditorView.theme({
                    "&": {
                        fontSize: "var(--font-ui-medium)",
                        fontFamily: "var(--font-text)",
                        minHeight: "120px",
                        maxHeight: "400px",
                        backgroundColor: "var(--background-primary)",
                        color: "var(--text-normal)"
                    },
                    ".cm-content": {
                        padding: "var(--size-4-3)",
                        minHeight: "120px",
                        backgroundColor: "transparent",
                        color: "var(--text-normal)",
                        lineHeight: "var(--line-height-normal)",
                        caretColor: "var(--text-accent)"
                    },
                    ".cm-focused": {
                        outline: "none"
                    },
                    ".cm-editor": {
                        borderRadius: "var(--radius-m)",
                        border: "1px solid var(--background-modifier-border)",
                        backgroundColor: "var(--background-primary)",
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                    },
                    ".cm-editor.cm-focused": {
                        borderColor: "var(--interactive-accent)",
                        boxShadow: "0 0 0 2px var(--interactive-accent-hover)"
                    },
                    ".cm-cursor": {
                        borderLeftColor: "var(--text-accent)",
                        borderLeftWidth: "2px"
                    },
                    ".cm-selectionBackground": {
                        backgroundColor: "var(--text-selection) !important"
                    },
                    ".cm-activeLine": {
                        backgroundColor: "var(--background-primary-alt)"
                    },
                    ".cm-foldGutter": {
                        backgroundColor: "var(--background-secondary)",
                        borderRight: "1px solid var(--background-modifier-border)",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-ui-smaller)"
                    },
                    ".cm-placeholder": {
                        color: "var(--text-muted)",
                        fontStyle: "italic"
                    }
                }),
                EditorView.lineWrapping
                // 移除快捷键支持
            ]
        });

        // 创建编辑器视图
        const editorView = new EditorView({
            state,
            parent: container
        });

        // 设置占位符文本
        editorView.dom.setAttribute('data-placeholder', "编辑备忘录内容...");

        return editorView;
    }

    /**
     * 创建编辑按钮（保存和取消）
     * @param file 备忘录文件
     * @param container 容器元素
     * @param editCodeMirrorView 编辑器视图
     * @param buttonGroup 按钮组容器
     * @param fileCache 文件缓存信息
     */
    private createEditButtons(
        file: TFile,
        container: HTMLDivElement,
        editCodeMirrorView: EditorView,
        buttonGroup: HTMLElement,
        fileCache: any
    ): void {
        // 创建保存按钮
        const saveButton = buttonGroup.createEl("button", {
            text: "保存", // 移除快捷键提示
            cls: "mod-cta"
        });

        // 创建取消按钮
        const cancelButton = buttonGroup.createEl("button", {
            text: "取消"
        });

        // 注册保存按钮事件
        this.registerDomEvent(saveButton, 'click', async () => {
            await this.handleEditSave(file, container, editCodeMirrorView, fileCache);
        });

        // 注册取消按钮事件
        this.registerDomEvent(cancelButton, 'click', async () => {
            container.removeClass("is-editing");
            await this.renderMemoReadView(file, container);
        });
    }

    /**
     * 处理编辑保存操作
     * @param file 备忘录文件
     * @param container 容器元素
     * @param editCodeMirrorView 编辑器视图
     * @param fileCache 文件缓存信息
     */
    private async handleEditSave(
        file: TFile,
        container: HTMLDivElement,
        editCodeMirrorView: EditorView,
        fileCache: any
    ): Promise<void> {
        try {
            // 获取编辑器中的新内容
            const newBodyContent = editCodeMirrorView.state.doc.toString().trim();

            // 获取现有的frontmatter并更新时间戳
            const frontmatter = fileCache?.frontmatter ? { ...fileCache.frontmatter } : {};
            delete frontmatter.position; // 清理缓存专用属性
            frontmatter.updatedAt = moment().format();

            // 重新构建完整的文件内容
            const newFullContent = `---\n${stringifyYaml(frontmatter)}---\n\n${newBodyContent}`;

            // 保存文件
            await this.app.vault.modify(file, newFullContent);

            // 退出编辑模式并刷新视图
            container.removeClass("is-editing");
            await this.renderMemoReadView(file, container);

            new Notice("备忘录已更新");

        } catch (error) {
            console.error(`保存编辑内容时出错:`, error);
            new Notice("保存失败，请重试");
        }
    }

    /**
     * 视图关闭时的清理方法
     * 清理事件监听器和释放资源
     */
    async onClose(): Promise<void> {
        // 清理资源和事件监听器
        // Obsidian会自动清理通过registerDomEvent注册的事件
    }
}
