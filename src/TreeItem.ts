import * as vscode from "vscode"
import { VSCodeTreeData } from "./TreeRecipe"
import { i18n } from "dropin-recipes"

export class VSCodeTreeItem extends vscode.TreeItem {

  constructor(id: string, private data: VSCodeTreeData) {
    super(i18n(data.label), vscode.TreeItemCollapsibleState.Collapsed)
    this.contextValue = id
  }

  getChildren(): VSCodeTreeItem[] {
    return []
  }

}
