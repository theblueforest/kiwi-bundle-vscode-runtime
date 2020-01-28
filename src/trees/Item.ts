import * as vscode from "vscode"
import { VSCodeTreeRecipe } from "./Provider"

export interface VSCodeTreeItemOptions {
  description?: string
}

export class VSCodeTreeItem extends vscode.TreeItem {
  constructor(id: string[], label: string, private children?: VSCodeTreeRecipe, options: VSCodeTreeItemOptions = {}) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed)
    this.contextValue = id.join("-")
    this.description = options.description
  }

  getChildren() {
    return this.children
  }
}
