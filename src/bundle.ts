import { i18nSettings } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeParams, VSCodeTreeProvider } from "./trees/Provider"
import { VSCodeTreeHandlers } from "./trees/Handlers"

export interface KiwiBundleVSCodeParams {
  trees?: { [treeId: string]: VSCodeTreeParams }
}

export const KiwiBundleVSCode = (params: KiwiBundleVSCodeParams) => {
  // Locale
  i18nSettings.setCurrentLanguageFromString(vscode.env.language)

  // Trees
  if(typeof params.trees !== "undefined") {
    const trees = params.trees
    Object.keys(trees).forEach(treeId => {
      if(typeof trees[treeId].handlers !== "undefined") {
        trees[treeId].handlers?.handleCommands((name, command) => {
          vscode.commands.registerCommand(`tree.${treeId}.${name}`, context => {
            command(context)
          })
        })
      }
      vscode.window.registerTreeDataProvider(treeId, new VSCodeTreeProvider(trees[treeId]))
    })
  }
}
