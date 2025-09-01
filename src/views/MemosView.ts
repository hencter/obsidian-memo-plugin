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
    return 'Memos view';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Memos view' });
  }

  async onClose() {
    // Nothing to clean up.
  }
}