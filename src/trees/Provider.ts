import { i18nData, TreeObject, i18n, XOR, i18nContent, i18nQuery } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeItemOptions, VSCodeTreeItem } from "./Item"
import { VSCodeTreeHandlers } from "./Handlers"

export type VSCodeTreeData = XOR<{
  label: i18nContent
  path?: string
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
    // Handlers
    if(typeof params.handlers !== "undefined") {
      params.handlers.registerCommands((name, command) => {
        vscode.commands.registerCommand(`tree.${id}.${name}`, command)
      })
      params.handlers.init(this)
    }
  }

  private extractChildrenItems(children?: VSCodeTreeRecipe, itemChildren?: VSCodeTreeData, index?: number): TreeObject<VSCodeTreeData>[] {
    if(!Array.isArray(children)) {
      if(typeof index !== "undefined") {
        return [
          {
            id: (children?.id as string[])[index],
            data: (children?.data as VSCodeTreeData[])[index],
            children: children?.children,
          }
        ]
      }
      if(typeof children !== "undefined") {
        return [ children ]
      }
      if(typeof itemChildren !== "undefined" && typeof itemChildren.path !== "undefined") {
        return [ { id: itemChildren.path, data: itemChildren }
        ]
      }
    }
    return children as TreeObject<VSCodeTreeData>[]
  }

  private convertDataToItem(itemPath: string[], id: string, itemData: VSCodeTreeData, children?: TreeObject<VSCodeTreeData>["children"], index?: number): VSCodeTreeItem[] {
    if(typeof itemData.$ !== "undefined") { // Looking for handlers
      if(typeof this.params.handlers !== "undefined") {
        return this.params.handlers.runItemHandler(itemData.$.name).map(childData => { // For each handler result
          if(typeof childData.path !== "undefined") id = childData.path // Set path as id for handler items
          const childItemPath = [ ...itemPath, (itemData as any).$.name, id ]
          return new VSCodeTreeItem(childItemPath, childData.label as string, this.extractChildrenItems(children, childData.children, index), childData.options)
        })
      }
    } else if(typeof itemData.label === "object" && typeof this.params.i18n !== "undefined") {
      const i18nLabel = (itemData.label as i18nQuery).$
      const label = i18n(this.params.i18n[i18nLabel.name as string] as i18nContent, i18nLabel.options)
      return [
        new VSCodeTreeItem([ ...itemPath, id ], label, this.extractChildrenItems(children, itemData.children, index), itemData.options),
      ]
    }
    return [
      new VSCodeTreeItem([ ...itemPath, id ], i18n(itemData.label as i18nContent), this.extractChildrenItems(children, itemData.children, index), itemData.options),
    ]
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
          return Promise.reject("Id must be an string if data is not an array")
        } else {
          items.push(...this.convertDataToItem(itemPath, recipeItem.id, recipeItem.data, recipeItem.children))
        }
        return items
      })
    }, Promise.resolve([]))
  }

  getTreeItem(item: VSCodeTreeItem): VSCodeTreeItem | Thenable<VSCodeTreeItem> {
    return item
  }

  getChildren(item?: VSCodeTreeItem): vscode.ProviderResult<VSCodeTreeItem[]> {
    if(typeof item !== "undefined") {
      return this.convertRecipeToItems(item.getChildren(), item.path)
    }
    return this.convertRecipeToItems(this.params.recipe, [])
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

}
