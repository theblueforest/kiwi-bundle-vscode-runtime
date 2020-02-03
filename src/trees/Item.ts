import * as vscode from "vscode"
import { TreeObject } from "dropin-recipes"
import { VSCodeTreeData } from "./Provider"

export interface VSCodeTreeItemOptions<Custom = any> {
  description?: string
  onClick?: string
  iconPath?: string | { dark?: string, light?: string }
  custom?: Custom
}

export class VSCodeTreeItem<Custom = any> extends vscode.TreeItem {
  public custom?: Custom

  constructor(public contextValue: string, public path: string[], label: string, private children: TreeObject<VSCodeTreeData>[] = [], options: VSCodeTreeItemOptions<Custom> = {}) {
    super(label)
    this.description = options.description
    if(typeof options.onClick !== "undefined") {
      this.command = { title: `${this.contextValue}.onClick`, command: options.onClick, arguments: [ JSON.parse(JSON.stringify(this)) ] }
    } else if(children.length !== 0) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    }
    this.iconPath = options.iconPath
    this.custom = options.custom
    console.log("[DEBUG] ITEM --- label:", this.label, "\t\t\tcontextValue:", this.contextValue, "\t\t\tpath:", JSON.stringify(this.path))
  }

  getChildren() {
    return this.children
  }

}
