import * as vscode from "vscode"
import { VSCodeTreeRecipe } from "./Provider"

export class VSCodeTreeItem extends vscode.TreeItem {
  constructor(public contextValue: string, label: string, private children: VSCodeTreeRecipe = []) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed)
  }

  getChildren() {
    return this.children
  }
}
