# Memos 垂直精确填充布局

## 概述

本文档详细说明了 Memos 插件的垂直精确填充布局实现。该布局确保所有备忘录卡片垂直排列，并通过精确的高度计算算法，使卡片组合起来正好填满容器空间，既不超出也不留白。

## 核心特性

### 1. 精确高度分配

- **智能计算**：动态计算每个卡片的最佳高度
- **完美填充**：确保所有卡片组合起来正好填满容器
- **无留白**：消除容器底部的空白区域
- **无溢出**：防止内容超出容器边界

### 2. 自适应调整

- **内容适配**：根据卡片实际内容调整高度分配
- **比例缩放**：当内容过多时按比例缩减高度
- **空间分配**：当内容较少时合理分配剩余空间
- **响应式**：窗口大小变化时自动重新计算

### 3. 用户体验优化

- **流畅交互**：防抖处理确保性能流畅
- **视觉一致**：保持卡片间距和样式统一
- **内容可见**：确保重要内容始终可见
- **滚动优化**：卡片内容支持独立滚动

## 技术实现

### 核心算法

```typescript
/**
 * 精确高度计算算法
 * 1. 获取容器可用高度
 * 2. 计算卡片间距总高度
 * 3. 测量每个卡片的自然内容高度
 * 4. 根据内容总高度与可用高度的关系进行分配
 */
private async calculateAndApplyCardHeights(): Promise<void> {
    // 获取所有卡片元素
    const memoItems = this.memosContainer.querySelectorAll('.memo-item');
    
    // 计算容器可用高度
    const availableHeight = containerHeight - containerPadding;
    
    // 计算间距总高度
    const totalGapHeight = (memoItems.length - 1) * gapHeight;
    
    // 测量每个卡片的自然高度
    const cardHeightRequirements = [];
    memoItems.forEach(item => {
        item.style.height = 'auto';
        cardHeightRequirements.push(item.scrollHeight);
    });
    
    // 计算可分配高度
    const availableContentHeight = availableHeight - totalGapHeight;
    
    if (totalContentHeight <= availableContentHeight) {
        // 内容较少：分配剩余空间
        const extraSpace = availableContentHeight - totalContentHeight;
        const extraPerCard = extraSpace / memoItems.length;
        
        memoItems.forEach((item, index) => {
            const finalHeight = cardHeightRequirements[index] + extraPerCard;
            item.style.height = `${finalHeight}px`;
        });
    } else {
        // 内容过多：按比例缩减
        const scaleFactor = availableContentHeight / totalContentHeight;
        
        memoItems.forEach((item, index) => {
            const finalHeight = cardHeightRequirements[index] * scaleFactor;
            item.style.height = `${finalHeight}px`;
        });
    }
}
```

### CSS 布局结构

```css
/* 容器：垂直布局，填满高度 */
.memos-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 卡片：弹性布局，精确高度 */
.memo-item {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--size-4-3);
  overflow: hidden;
}

/* 计算高度的卡片：固定高度 */
.memo-item.calculated-height {
  flex: none;
}

/* 内容区域：弹性填充 */
.memo-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  word-wrap: break-word;
}
```

## 布局优势

### 1. 空间利用率

- **100% 填充**：完全利用容器空间
- **无浪费**：消除不必要的留白
- **最大化内容**：在有限空间内展示更多内容

### 2. 视觉效果

- **整齐排列**：卡片垂直对齐，视觉统一
- **比例协调**：根据内容重要性分配空间
- **界面简洁**：避免滚动条和留白的视觉干扰

### 3. 交互体验

- **预期行为**：符合用户对垂直列表的使用习惯
- **响应迅速**：实时响应窗口大小变化
- **操作流畅**：防抖处理确保性能

## 响应式特性

### 窗口大小变化

- **自动重算**：窗口大小变化时自动重新计算高度
- **防抖优化**：300ms 防抖避免频繁计算
- **平滑过渡**：CSS transition 提供平滑的高度变化

### 内容变化适配

- **新增卡片**：添加备忘录后自动重新分配高度
- **删除卡片**：删除备忘录后重新计算剩余卡片高度
- **编辑更新**：内容编辑后更新高度分配

## 性能优化

### 1. 计算优化

- **批量处理**：一次性计算所有卡片高度
- **DOM 优化**：最小化 DOM 操作次数
- **异步处理**：使用 requestAnimationFrame 确保渲染完成

### 2. 事件优化

- **防抖处理**：限制窗口大小变化事件的处理频率
- **事件清理**：视图关闭时清理所有事件监听器
- **内存管理**：避免内存泄漏

### 3. 渲染优化

- **双帧等待**：确保 DOM 完全渲染后再计算
- **样式缓存**：缓存计算结果避免重复计算
- **选择器优化**：使用高效的 DOM 选择器

## 浏览器兼容性

### 支持的特性

- **Flexbox**：现代浏览器完全支持
- **CSS 变量**：Obsidian 环境完全支持
- **requestAnimationFrame**：所有现代浏览器支持
- **getComputedStyle**：标准 API，兼容性良好

### 降级处理

- **默认高度**：计算失败时使用默认的 flex 布局
- **错误处理**：捕获计算错误，提供备用方案
- **渐进增强**：基础功能在所有环境下可用

## 使用说明

### 自动启用

垂直精确填充布局在 Memos 视图中自动启用，无需额外配置。

### 预期行为

1. **初始加载**：所有卡片自动分配高度填满容器
2. **窗口调整**：拖拽窗口边界时卡片高度自动调整
3. **内容变化**：添加或删除备忘录时重新分配高度
4. **编辑模式**：编辑完成后更新高度分配

### 最佳实践

- **适量内容**：每个备忘录保持适中的内容长度
- **合理数量**：避免同时显示过多备忘录
- **定期整理**：删除不需要的备忘录保持界面整洁

## 技术细节

### 高度计算公式

```
可用内容高度 = 容器高度 - 容器内边距 - 卡片间距总和

当 总内容高度 ≤ 可用内容高度 时：
  每卡片最终高度 = 自然高度 + (剩余空间 / 卡片数量)

当 总内容高度 > 可用内容高度 时：
  缩放因子 = 可用内容高度 / 总内容高度
  每卡片最终高度 = 自然高度 × 缩放因子
```

### 关键时机

1. **DOM 渲染完成**：等待两个 requestAnimationFrame
2. **样式计算完成**：获取准确的元素尺寸
3. **高度应用前**：移除现有高度限制
4. **计算完成后**：应用新的精确高度

### 错误处理

- **容器不存在**：跳过计算，使用默认布局
- **卡片为空**：提前返回，避免无效计算
- **尺寸获取失败**：使用默认值继续计算
- **计算异常**：捕获错误，恢复默认状态

## 未来改进

### 1. 性能优化

- **虚拟滚动**：支持大量卡片的虚拟滚动
- **增量计算**：只重新计算变化的卡片
- **Web Worker**：将复杂计算移至 Worker 线程

### 2. 功能增强

- **最小高度限制**：设置卡片最小高度阈值
- **优先级权重**：根据重要性分配不同权重
- **动画过渡**：添加高度变化的动画效果

### 3. 用户定制

- **高度策略**：提供多种高度分配策略
- **间距调整**：允许用户自定义卡片间距
- **布局模式**：支持切换不同的布局模式

---

**注意**：此布局专为 Obsidian 环境优化，充分利用了 Obsidian 的 CSS 变量系统和现代浏览器特性，确保在 Obsidian 中提供最佳的用户体验。
