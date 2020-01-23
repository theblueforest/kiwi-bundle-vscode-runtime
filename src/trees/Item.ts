import * as vscode from "vscode"
import { VSCodeTreeRecipe } from "./Provider"

interface VSCodeTreeItemOptions {
  label: string
  description?: string
}

export class VSCodeTreeItem extends vscode.TreeItem {
  constructor(public contextValue: string, options: VSCodeTreeItemOptions, private children: VSCodeTreeRecipe) {
    super(options.label, vscode.TreeItemCollapsibleState.Collapsed)
    this.description = options.description
  }

  getChildren() {
    return this.children
  }
}
