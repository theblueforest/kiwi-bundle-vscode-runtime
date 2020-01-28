import { i18nSettings } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeParams, VSCodeTreeProvider } from "./trees/Provider"

export interface KiwiBundleVSCodeParams<Context> {
  context?: Context
  trees?: { [treeId: string]: VSCodeTreeParams }
}

export const KiwiBundleVSCode = <Context = any>(params: KiwiBundleVSCodeParams<Context>) => {
  // Locale
  i18nSettings.setCurrentLanguageFromString(vscode.env.language)

  // Trees
  if(typeof params.trees !== "undefined") {
    const trees = params.trees
    Object.keys(trees).forEach(treeId => {
      vscode.window.registerTreeDataProvider(treeId, new VSCodeTreeProvider(trees[treeId]))
    })
  }
}
