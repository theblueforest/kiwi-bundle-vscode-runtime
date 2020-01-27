import { i18nData, TreeObject, i18n, XOR, i18nContent, NameField_i18n, i18nQuery } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeItemOptions, VSCodeTreeItem } from "./Item"

interface VSCodeTreeDataChanges {
  insert?: (data: VSCodeTreeData) => void
  update: (data: VSCodeTreeData) => void
  delete?: (data: VSCodeTreeData) => void
}

export type VSCodeTreeData = XOR<{
  label: i18nContent
  options?: VSCodeTreeItemOptions
  changes?: (fire: VSCodeTreeDataChanges) => void
}, {
  $: { type: "handler", name: string }
}>

export type VSCodeTreeRecipe = TreeObject<VSCodeTreeData>[]

export type VSCodeTreeHandlers = { [functionName: string]: any }

export interface VSCodeTreeParams {
  recipe: VSCodeTreeRecipe
  handlers?: VSCodeTreeHandlers
  i18n?: i18nData
}

export class VSCodeTreeProvider implements vscode.TreeDataProvider<VSCodeTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<VSCodeTreeItem> = new vscode.EventEmitter<VSCodeTreeItem>()
  onDidChangeTreeData: vscode.Event<VSCodeTreeItem> = this._onDidChangeTreeData.event

  cache: any[] = []

  constructor(private params: VSCodeTreeParams) {}

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
      if(typeof this.params.handlers !== "undefined" && typeof this.params.handlers[data.$.name] !== "undefined") {
        const name = data.$.name
        return this.params.handlers[name]().map((element: VSCodeTreeData) => {
          const item = new VSCodeTreeItem(`${id}-${name}`, element.label as string, this.extractItemChildren(children, index), element.options)
          if(typeof element.changes !== "undefined") {
            element.changes({
              update: updatedItem => {
                console.log("UPDATE !")
                item.label = updatedItem.label as string
                this._onDidChangeTreeData.fire(item)
              },
            })
          }
          return item
        })
      }
    } else if(typeof data.label === "object" && typeof this.params.i18n !== "undefined") {
      const element = (data.label as i18nQuery).$
      const label = i18n(this.params.i18n[element.name as string] as i18nContent, element.options)
      return [ new VSCodeTreeItem(id, label, this.extractItemChildren(children, index)) ]
    }
    return [
      new VSCodeTreeItem(id, i18n(data.label as i18nContent), this.extractItemChildren(children, index))
    ]
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

}
