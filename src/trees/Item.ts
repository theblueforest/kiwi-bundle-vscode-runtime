import * as vscode from "vscode"
import { VSCodeTreeRecipe } from "./Provider"

export interface VSCodeTreeItemOptions {
  description?: string
  command?: vscode.Command
}

export class VSCodeTreeItem extends vscode.TreeItem {

  constructor(id: string[], label: string, private children: VSCodeTreeRecipe, options: VSCodeTreeItemOptions = {}) {
    super(label)
    this.contextValue = id.join("-")
    if(children.length !== 0) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    } else {
      this.command = { title: "test", command: "tree.catalog.test", arguments: [ this.contextValue ] }
    }
    this.description = options.description
  }

  getChildren() {
    return this.children
  }

}
