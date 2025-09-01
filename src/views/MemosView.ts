import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_MEMOS = 'memos-view';

export class MemosView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_MEMOS;
  }

  getDisplayText() {
    // 视图标题（标签页）
    return 'Memos';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Memos' });
  }

  async onClose() {
    // Nothing to clean up.
  }
}