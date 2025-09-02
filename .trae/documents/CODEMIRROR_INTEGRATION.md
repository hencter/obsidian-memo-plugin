# CodeMirror 6 编辑器集成文档

## 概述

本插件已成功将原有的 `textarea` 文本编辑器替换为 Obsidian 内置的 CodeMirror 6 编辑器组件，提供了更强大的编辑体验和更好的用户界面一致性。

## 技术实现

### 1. 依赖包安装

```bash
pnpm add @codemirror/view @codemirror/state @codemirror/lang-markdown @codemirror/theme-one-dark codemirror
```

### 2. 核心组件

#### 主编辑器 (createCodeMirrorEditor)

- **位置**: `MemosView.ts` 第 116-168 行
- **功能**: 创建主界面的备忘录输入编辑器
- **特性**:
  - 支持 Markdown 语法高亮
  - 自动换行
  - 快捷键支持 (Ctrl+Enter)
  - 占位符提示
  - 响应式高度调整

#### 编辑模式编辑器 (createEditCodeMirrorEditor)

- **位置**: `MemosView.ts` 第 654-708 行
- **功能**: 创建编辑模式下的 CodeMirror 编辑器
- **特性**:
  - 更大的编辑区域 (120px-400px)
  - 完整的 Markdown 支持
  - 快捷键集成
  - 自动聚焦和光标定位

### 3. 编辑器配置

#### 基础配置

```typescript
const state = EditorState.create({
    doc: initialContent,
    extensions: [
        basicSetup,           // 基础编辑功能
        markdown(),           // Markdown 语法支持
        EditorView.theme({    // 自定义主题
            // 样式配置
        }),
        EditorView.lineWrapping,  // 自动换行
        EditorView.domEventHandlers({  // 事件处理
            // 快捷键处理
        })
    ]
});
```

#### 主题集成

编辑器完全集成了 Obsidian 的主题系统：

- 使用 Obsidian CSS 变量
- 支持深色/浅色主题切换
- 与 Obsidian 界面风格保持一致

### 4. 编辑器功能

#### 基础功能

- **Markdown 语法高亮**: 实时语法高亮显示
- **自动补全**: 基础的 Markdown 自动补全
- **代码折叠**: 支持代码块折叠
- **搜索功能**: 内置搜索和替换功能

### 5. CSS 样式集成

#### 主编辑器样式

```css
.memos-editor-container .cm-editor {
    background-color: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-text);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
}
```

#### 编辑模式样式

```css
.memo-edit-container .cm-editor {
    /* 编辑模式特定样式 */
    min-height: 120px;
    max-height: 400px;
}
```

## 功能特性

### 1. Markdown 支持

- **语法高亮**: 实时 Markdown 语法高亮
- **自动补全**: 基础的 Markdown 自动补全
- **格式化**: 支持常见的 Markdown 格式

### 2. 用户体验

- **占位符**: 智能占位符提示
- **自动聚焦**: 编辑模式自动聚焦
- **光标定位**: 编辑时光标自动定位到内容末尾
- **响应式**: 根据内容自动调整高度

### 3. 性能优化

- **延迟加载**: 编辑器按需创建
- **内存管理**: 适当的资源清理
- **事件优化**: 高效的事件处理机制

## 兼容性

### 浏览器支持

- **Chrome/Edge**: 完全支持
- **Firefox**: 完全支持
- **Safari**: 完全支持
- **移动端**: 基础支持

### Obsidian 版本

- **最低版本**: 0.15.0
- **推荐版本**: 1.0.0+
- **测试版本**: 1.4.x

## 迁移说明

### 从 textarea 到 CodeMirror

1. **API 变更**:
   - `editArea.value` → `editorView.state.doc.toString()`
   - `editArea.focus()` → `editorView.focus()`
   - 事件处理从 DOM 事件转为 CodeMirror 扩展

2. **样式更新**:
   - 新增 `.memos-editor-container` 样式
   - 更新编辑模式样式
   - 保持与 Obsidian 主题的兼容性

3. **功能增强**:
   - 更好的 Markdown 支持
   - 改进的快捷键处理
   - 更一致的用户体验

## 故障排除

### 常见问题

1. **编辑器不显示**
   - 检查 CodeMirror 依赖是否正确安装
   - 验证 CSS 样式是否加载

2. **编辑器功能异常**
   - 确认 CodeMirror 扩展正确加载
   - 检查是否有其他插件冲突

3. **样式问题**
   - 验证 Obsidian CSS 变量可用性
   - 检查主题兼容性

### 调试技巧

```typescript
// 在控制台检查编辑器状态
console.log(this.codeMirrorView.state.doc.toString());

// 检查编辑器是否正确初始化
console.log(this.codeMirrorView ? 'Editor initialized' : 'Editor not found');
```

## 未来改进

### 计划功能

1. **扩展支持**: 添加更多 CodeMirror 扩展
2. **自定义主题**: 支持用户自定义编辑器主题
3. **插件集成**: 与其他 Obsidian 插件更好的集成
4. **性能优化**: 进一步的性能优化

### 技术债务

1. **类型安全**: 改进 TypeScript 类型定义
2. **错误处理**: 增强错误处理机制
3. **测试覆盖**: 添加单元测试和集成测试

---

**注意**: 本文档记录了 CodeMirror 6 编辑器的完整集成过程。如有问题或建议，请参考 Obsidian 插件开发文档或提交 Issue。
