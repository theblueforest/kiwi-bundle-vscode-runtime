import * as vscode from "vscode"
import { TreeObject } from "dropin-recipes"
import { VSCodeTreeData } from "./Provider"

export interface VSCodeTreeItemOptions {
  description?: string
  onClick?: string
  iconPath?: string | { dark?: string, light?: string }
}

export class VSCodeTreeItem extends vscode.TreeItem {

  constructor(public contextValue: string, public path: string[], label: string, private children: TreeObject<VSCodeTreeData>[] = [], options: VSCodeTreeItemOptions = {}) {
    super(label)
    this.description = options.description
    if(typeof options.onClick !== "undefined") {
      this.command = { title: `${this.contextValue}.onClick`, command: options.onClick, arguments: [ path ] }
    } else if(children.length !== 0) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    }
    this.iconPath = options.iconPath
    console.log("[DEBUG] ITEM --- label:", this.label, "\t\t\tcontextValue:", this.contextValue, "\t\t\tpath:", JSON.stringify(this.path))
  }

  getChildren() {
    return this.children
  }

}
