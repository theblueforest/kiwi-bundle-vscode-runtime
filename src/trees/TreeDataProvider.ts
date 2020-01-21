import * as vscode from "vscode"
import { VSCodeTreeObject, VSCodeTreeData } from "./TreeRecipe"
import { VSCodeTreeHandler } from "./TreeHandler"
import { VSCodeTreeItem } from "./TreeItem"
import { TreeObjectReader } from "./TreeObjectReader"

export interface VSCodeTreeParams {
  recipe: VSCodeTreeObject
  handler: VSCodeTreeHandler
  i18n?: any
}

export class VSCodeTreeDataProvider implements vscode.TreeDataProvider<VSCodeTreeItem> {
  constructor(private params: VSCodeTreeParams) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    console.log("# getTreeItem")
    return element
  }

  getChildren(element?: VSCodeTreeItem): vscode.ProviderResult<VSCodeTreeItem[]> {
    console.log("# getChildren")
    if(typeof element === "undefined") {
      return TreeObjectReader.convert<VSCodeTreeData, VSCodeTreeItem>(this.params.recipe, (id, data) => {
        return new VSCodeTreeItem(id, data)
      })
    }
  }

}
