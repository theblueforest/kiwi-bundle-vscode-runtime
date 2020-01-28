import { i18nData, TreeObject, i18n, XOR, i18nContent, i18nQuery } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeItemOptions, VSCodeTreeItem } from "./Item"
import { VSCodeTreeHandlers } from "./Handlers"

export type VSCodeTreeData = XOR<{
  label: i18nContent
  options?: VSCodeTreeItemOptions
}, {
  $: { type: "handler", name: string }
}>

export type VSCodeTreeRecipe = TreeObject<VSCodeTreeData>[]

export interface VSCodeTreeParams {
  recipe: VSCodeTreeRecipe
  handlers?: VSCodeTreeHandlers
  i18n?: i18nData
  init?: (provider: VSCodeTreeProvider) => void
}

export interface VSCodeTreeContext {
  update: (data?: VSCodeTreeData) => void
}

export class VSCodeTreeProvider implements vscode.TreeDataProvider<VSCodeTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<VSCodeTreeItem> = new vscode.EventEmitter<VSCodeTreeItem>()
  onDidChangeTreeData: vscode.Event<VSCodeTreeItem> = this._onDidChangeTreeData.event

  constructor(private params: VSCodeTreeParams) {
    if(typeof params.init !== "undefined") {
      params.init(this)
    }
  }

  private extractItemChildren(children?: TreeObject<VSCodeTreeData>["children"], index?: number): VSCodeTreeRecipe {
    if(!Array.isArray(children)) {
      const list: VSCodeTreeRecipe = []
      if(typeof index !== "undefined") {
        list.push({
          id: (children?.id as string[])[index],
          data: (children?.data as VSCodeTreeData[])[index],
          children: children?.children,
        })
      }
      return list
    }
    return children as VSCodeTreeRecipe
  }

  private generateItems(id: string, data: VSCodeTreeData, children?: TreeObject<VSCodeTreeData>["children"], index?: number): VSCodeTreeItem[] {
    if(typeof data.$ !== "undefined") {
      if(typeof this.params.handlers !== "undefined") {
        const name = data.$.name
        return this.params.handlers.runTreeHandler(name).map(element => {
          return new VSCodeTreeItem([ id, name ], element.label as string, this.extractItemChildren(children, index), element.options)
        })
      }
    } else if(typeof data.label === "object" && typeof this.params.i18n !== "undefined") {
      const element = (data.label as i18nQuery).$
      const label = i18n(this.params.i18n[element.name as string] as i18nContent, element.options)
      return [ new VSCodeTreeItem([ id ], label, this.extractItemChildren(children, index)) ]
    }
    return [  new VSCodeTreeItem([ id ], i18n(data.label as i18nContent), this.extractItemChildren(children, index)) ]
  }

  private getItems(recipe: VSCodeTreeRecipe): Promise<VSCodeTreeItem[]> {
    if(!Array.isArray(recipe)) return Promise.reject("Tree must be an array")
    return recipe.reduce<Promise<VSCodeTreeItem[]>>((promise, current) => {
      if(typeof current.id === "undefined") return Promise.reject("Id is missing")
      if(typeof current.data === "undefined") return Promise.reject("Data is missing")
      return promise.then(list => {
        if(Array.isArray(current.id)) {
          if(!Array.isArray(current.data)) return Promise.reject("Id must be a string or data an array")
          if(current.id.length !== current.data.length) return Promise.reject("Lengths are different on id and data")
          current.id.forEach((currentId: string, index: number) => {
            list.push(...this.generateItems(currentId, (current.data as VSCodeTreeData[])[index], current.children, index))
          })
        } else if(Array.isArray(current.data)) {
          return Promise.reject("Id must be an string if data is not an array")
        } else {
          list.push(...this.generateItems(current.id, current.data, current.children))
        }
        return list
      })
    }, Promise.resolve([]))
  }

  getTreeItem(element: VSCodeTreeItem): VSCodeTreeItem | Thenable<VSCodeTreeItem> {
    return element
  }

  getChildren(element?: VSCodeTreeItem): vscode.ProviderResult<VSCodeTreeItem[]> {
    if(typeof element !== "undefined") {
      return this.getItems(element.getChildren())
    }
    return this.getItems(this.params.recipe)
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

}
