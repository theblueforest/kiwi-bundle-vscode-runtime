import { i18nData, TreeObject, i18n, XOR, i18nContent, i18nQuery, Recipe } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeItemOptions, VSCodeTreeItem } from "./Item"
import { VSCodeTreeHandlers } from "./Handlers"

export type VSCodeTreeData = XOR<{
  path?: string|string[]
  label: i18nContent
  options?: VSCodeTreeItemOptions
  children?: VSCodeTreeData
}, {
  $: { type: "handler", name: string }
}>

export type VSCodeTreeRecipe = TreeObject<VSCodeTreeData> | TreeObject<VSCodeTreeData>[]

export interface VSCodeTreeParams {
  recipe: VSCodeTreeRecipe
  handlers?: VSCodeTreeHandlers
  i18n?: i18nData
}

export interface VSCodeTreeContext {
  update: (data?: VSCodeTreeData) => void
}

export class VSCodeTreeProvider implements vscode.TreeDataProvider<VSCodeTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<VSCodeTreeItem> = new vscode.EventEmitter<VSCodeTreeItem>()
  onDidChangeTreeData: vscode.Event<VSCodeTreeItem> = this._onDidChangeTreeData.event

  constructor(public id: string, private params: VSCodeTreeParams) {
    if(typeof params.handlers !== "undefined") {
      params.handlers.registerCommands((name, command) => {
        vscode.commands.registerCommand(`tree.${id}.${name}`, command)
      })
      params.handlers.init(this)
    }
  }

  private getItemDataPath(previousPath: string[], id: string, childPath?: string|string[]): { contextValue: string, path: string[] } {
    if(typeof childPath === "undefined") {
      return { contextValue: id, path: [ ...previousPath, id ] }
    }
    if(Array.isArray(childPath)) {
      const path: string[] = [ ...previousPath ]
      if(typeof childPath === "undefined") path.push(id)
      return { contextValue: childPath.length !== 0 ? childPath[0] : id, path: [ ...path, ...childPath ] }
    }
    return { contextValue: childPath, path: [ ...previousPath, id, childPath ] }
  }

  private extractChildrenItems(childrenRecipe?: VSCodeTreeRecipe, childrenItem?: VSCodeTreeData, childrenIndex?: number): TreeObject<VSCodeTreeData>[] {
    if(Array.isArray(childrenRecipe)) return childrenRecipe
    if(typeof childrenRecipe !== "undefined") {
      let recipe = childrenRecipe as TreeObject<VSCodeTreeData>
      if(typeof childrenIndex !== "undefined") {
        recipe.id = recipe.id[childrenIndex]
        recipe.data = (recipe.data as VSCodeTreeData[])[childrenIndex]
        return [ recipe ]
      }
      return [ recipe ]
    }
    if(typeof childrenItem !== "undefined") {
      const id = Array.isArray(childrenItem.path) ? childrenItem.path[0] : childrenItem.path as string
      return [ { id, data: childrenItem } ]
    }
    return []
  }

  private convertDataToItem(previousPath: string[], itemId: string, itemData: VSCodeTreeData, itemChildren?: TreeObject<VSCodeTreeData>["children"], itemIndex?: number): VSCodeTreeItem[] {
    if(typeof itemData.$ !== "undefined" && typeof this.params.handlers !== "undefined") { // Looking for handlers
      return this.params.handlers.runItemHandler(itemData.$.name).map(childData => { // For each handler result
        console.log("\n1=====>")
        const itemDataPath = this.getItemDataPath(previousPath, itemId, childData.path)
        const childrenItems = this.extractChildrenItems(itemChildren, childData.children, itemIndex)
        return new VSCodeTreeItem(itemDataPath.contextValue, itemDataPath.path, childData.label as string, childrenItems, childData.options)
      })
    }
    const itemDataPath = this.getItemDataPath(previousPath, itemId, itemData.path)
    const childrenItems = this.extractChildrenItems(itemChildren, itemData.children, itemIndex)
    if(typeof itemData.label === "object" && typeof this.params.i18n !== "undefined") {
      console.log("\n2=====>")
      const i18nLabel = (itemData.label as i18nQuery).$
      const label = i18n(this.params.i18n[i18nLabel.name as string] as i18nContent, i18nLabel.options)
      return [ new VSCodeTreeItem(itemDataPath.contextValue, itemDataPath.path, label, childrenItems, itemData.options) ]
    }
    console.log("\n3=====>")
    return [ new VSCodeTreeItem(itemDataPath.contextValue, itemDataPath.path, i18n(itemData.label as i18nContent), childrenItems, itemData.options) ]
  }

  private convertRecipeToItems(recipe: VSCodeTreeRecipe, itemPath: string[]): Promise<VSCodeTreeItem[]> {
    if(!Array.isArray(recipe)) recipe = [ recipe ]
    return recipe.reduce<Promise<VSCodeTreeItem[]>>((promise, recipeItem) => {
      if(typeof recipeItem.id === "undefined") return Promise.reject("Id is missing")
      if(typeof recipeItem.data === "undefined") return Promise.reject("Data is missing")
      return promise.then(items => {
        if(Array.isArray(recipeItem.id)) {
          if(!Array.isArray(recipeItem.data)) return Promise.reject("Id must be a string or data an array")
          if(recipeItem.id.length !== recipeItem.data.length) return Promise.reject("Lengths are different on id and data")
          recipeItem.id.forEach((id: string, index: number) => {
            items.push(...this.convertDataToItem(itemPath, id, (recipeItem.data as VSCodeTreeData[])[index], recipeItem.children, index))
          })
        } else if(Array.isArray(recipeItem.data)) {
          recipeItem.data.forEach((childData: VSCodeTreeData) => {
            items.push(...this.convertDataToItem(itemPath, recipeItem.id as string, childData, recipeItem.children))
          })
        } else {
          items.push(...this.convertDataToItem(itemPath, recipeItem.id, recipeItem.data, recipeItem.children))
        }
        return items
      })
    }, Promise.resolve([])).then(items => {
      if(typeof this.params.handlers !== "undefined") this.params.handlers.onItems(items, this.depth)
      return items
    })
  }

  getTreeItem(item: VSCodeTreeItem): VSCodeTreeItem | Thenable<VSCodeTreeItem> {
    return item
  }

  private depth: number = 0

  getChildren(item?: VSCodeTreeItem): vscode.ProviderResult<VSCodeTreeItem[]> {
    if(typeof item !== "undefined") {
      this.depth++
      return this.convertRecipeToItems(item.getChildren(), item.path)
    }
    this.depth = 0
    return this.convertRecipeToItems(this.params.recipe, [])
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

}
