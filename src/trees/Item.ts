import * as vscode from "vscode"
import { VSCodeTreeData } from "./Provider"
import { TreeObject } from "dropin-recipes"

export interface VSCodeTreeItemOptions {
  description?: string
  onClick?: string
}

export class VSCodeTreeItem extends vscode.TreeItem {

  constructor(public path: string[], label: string, private children: TreeObject<VSCodeTreeData>[] = [], options: VSCodeTreeItemOptions = {}) {
    super(label)
    this.contextValue = path.join(".")
    this.description = options.description
    if(typeof options.onClick !== "undefined") {
      this.command = { title: `${this.collapsibleState}-onClick`, command: options.onClick, arguments: [ this ] }
    } else if(children.length !== 0) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    }
  }

  getChildren() {
    return this.children
  }

}
