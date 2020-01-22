import { i18nData } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeRecipe, VSCodeTreeHandlers } from "./types"
import { VSCodeTreeItem } from "./Item"

export interface VSCodeTreeParams {
  recipe: VSCodeTreeRecipe
  handlers?: VSCodeTreeHandlers
  i18n?: i18nData
}

export class VSCodeTreeDataProvider implements vscode.TreeDataProvider<VSCodeTreeItem> {
  constructor(private params: VSCodeTreeParams, private i18nData?: i18nData) {}

  private getItems(): Promise<VSCodeTreeItem[]> {
    if(!Array.isArray(this.params.recipe)) return Promise.reject("Tree must be an array")
    return this.params.recipe.reduce<Promise<VSCodeTreeItem[]>>((promise, current) => {
      if(typeof current.id === "undefined") {
        return Promise.reject("Id is missing")
      }

      if(typeof current.data === "undefined") {
        return Promise.reject("Data is missing")
      }

      return promise.then(list => {
        if(Array.isArray(current.id)) {
          if(!Array.isArray(current.data)) {
            return Promise.reject("Id must be a string or data an array")
          }
          if(current.id.length !== current.data.length) {
            return Promise.reject("Lengths are different on id and data")
          }
          current.id.forEach((currentId: string, index: number) => {
            list.push(new VSCodeTreeItem(currentId, (current.data as any)[index], current.children, this.i18nData))
          })
        } else if(Array.isArray(current.data)) {
          return Promise.reject("Id must be an string if data is not an array")
        } else {
          list.push(new VSCodeTreeItem(current.id, current.data as any, current.children, this.i18nData))
        }
        return list
      })
    }, Promise.resolve([]))
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    console.log("# getTreeItem")
    return element
  }

  getChildren(element?: VSCodeTreeItem): vscode.ProviderResult<VSCodeTreeItem[]> {
    console.log("# getChildren")
    if(typeof element !== "undefined") {
      return element.getChildren()
    }
    return this.getItems()
  }

}
