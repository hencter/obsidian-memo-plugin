# Memo Plugin 架构文档

## 项目结构

```plaintext
obsidian-memo-plugin/
├── src/
│   ├── types/           # 类型定义
│   │   └── settings.ts  # 设置相关类型
│   ├── modals/          # 模态框组件
│   │   └── SampleModal.ts
│   ├── settings/        # 设置页面组件
│   │   └── SettingTab.ts
│   └── commands/        # 命令管理
│       └── index.ts     # 命令注册器
├── main.ts              # 主插件入口
├── manifest.json        # 插件清单
└── ...
```

## 架构设计原则

### 1. 模块化分离

- **类型定义**：统一管理在 `src/types/` 目录
- **UI 组件**：模态框、设置页面等分别独立
- **功能模块**：命令管理、事件处理等职责分离

### 2. 清晰的依赖关系

- 主插件类 (`MemoPlugin`) 作为协调者
- 各模块通过构造函数注入依赖
- 避免循环依赖，使用接口抽象

### 3. 易于扩展

- 新增命令：在 `CommandManager` 中添加方法
- 新增设置：在 `settings.ts` 中扩展类型
- 新增 UI：在对应目录创建新组件

## 核心组件

### MemoPlugin (main.ts)

主插件类，负责：

- 插件生命周期管理
- 模块初始化和协调
- UI 组件设置
- 事件监听器注册

### CommandManager (src/commands/index.ts)

命令管理器，负责：

- 统一注册所有插件命令
- 命令逻辑的组织和管理
- 命令权限检查

### MemoSettingTab (src/settings/SettingTab.ts)

设置页面组件，负责：

- 插件设置界面渲染
- 设置项的交互逻辑
- 设置数据的保存

### SampleModal (src/modals/SampleModal.ts)

示例模态框组件，展示：

- 模态框的基本结构
- 生命周期方法的使用
- 内容渲染和清理

## 开发指南

### 添加新命令

1. 在 `CommandManager` 中添加新的私有方法
2. 在 `registerCommands()` 中调用该方法
3. 如需新的模态框，在 `src/modals/` 中创建

### 添加新设置

1. 在 `src/types/settings.ts` 中扩展接口
2. 更新 `DEFAULT_SETTINGS` 常量
3. 在 `MemoSettingTab` 中添加对应的 UI 控件

### 添加新的 UI 组件

1. 在对应目录创建新文件
2. 继承 Obsidian 的基础类
3. 在主插件类中引入和使用

## 最佳实践

1. **类型安全**：使用 TypeScript 严格类型检查
2. **职责单一**：每个类和模块职责明确
3. **依赖注入**：通过构造函数传递依赖
4. **资源清理**：在 `onunload` 中清理资源
5. **错误处理**：适当的错误边界和日志记录

## 编译和测试

```bash
# 开发模式编译
npm run dev

# 生产模式编译
npm run build

# 代码检查
npm run lint
```

## 扩展建议

1. **添加单元测试**：为核心逻辑添加测试用例
2. **国际化支持**：添加多语言支持
3. **主题适配**：确保在不同主题下的兼容性
4. **性能优化**：对频繁操作进行优化
5. **文档完善**：为每个模块添加详细文档
