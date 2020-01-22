import { i18nSettings, i18nData } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeParams, VSCodeTreeDataProvider } from "./trees/DataProvider"

export interface KiwiBundleVSCodeContext {
  trees?: { [treeId: string]: VSCodeTreeParams }
  i18n?: { [name: string]: i18nData }
}

export const KiwiBundleVSCode = (context: KiwiBundleVSCodeContext) => {
  // Locale
  i18nSettings.setCurrentLanguageFromString(vscode.env.language)

  // Trees
  if(typeof context.trees !== "undefined") {
    const trees = context.trees
    Object.keys(trees).forEach(treeId => {
      vscode.window.registerTreeDataProvider(treeId, new VSCodeTreeDataProvider(trees[treeId], context.i18n?.[treeId]))
    })
  }
}
