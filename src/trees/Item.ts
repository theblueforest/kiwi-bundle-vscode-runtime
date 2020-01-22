import * as vscode from "vscode"
import { i18n, i18nData } from "dropin-recipes"
import { VSCodeTreeRecipeData, VSCodeTreeRecipe } from "./types"

export class VSCodeTreeItem extends vscode.TreeItem {

  private static getLabel(label: VSCodeTreeRecipeData["label"], i18nData?: i18nData): string {
    if(typeof i18nData !== "undefined") {
      if(typeof label === "string") {
        return i18n(i18nData[label] as string)
      } else {
        return i18n(i18nData[label.$.name as string] as string, label.$.options)
      }
    }
    return i18n(label)
  }

  constructor(public contextValue: string, label: VSCodeTreeRecipeData["label"], private children?: VSCodeTreeRecipe, private i18nData?: i18nData) {
    super(VSCodeTreeItem.getLabel(label, i18nData), vscode.TreeItemCollapsibleState.Collapsed)
  }

  getChildren(): VSCodeTreeItem[] {
    console.log(this.children)
    return []
  }

}
