import { i18nSettings } from "dropin-recipes"
import * as vscode from "vscode"
import { VSCodeTreeParams, VSCodeTreeProvider } from "./trees/Provider"

export type KiwiBundleVSCodeCommand = ((...params: any[]) => void)

export type KiwiBundleVSCodeCommands = { [name: string]: KiwiBundleVSCodeCommands | KiwiBundleVSCodeCommand }

export interface KiwiBundleVSCodeParams {
  trees?: { [treeId: string]: VSCodeTreeParams }
  commands?: KiwiBundleVSCodeCommands
}

const registerCommands = (commands: KiwiBundleVSCodeCommands, name: string = "") => {
  if(typeof commands === "function") {
    if(name.length !== 0) {
      vscode.commands.registerCommand(`commands.${name}`, commands)
    }
  } else {
    Object.keys(commands).forEach(childName => {
      registerCommands(commands[childName] as KiwiBundleVSCodeCommands, `${name}${name.length === 0 ? "" : "."}${childName}`)
    })
  }
}

export const KiwiBundleVSCode = (params: KiwiBundleVSCodeParams) => {
  // Locale
  i18nSettings.setCurrentLanguageFromString(vscode.env.language)

  // Trees
  if(typeof params.trees !== "undefined") {
    const trees = params.trees
    Object.keys(trees).forEach(treeId => {
      vscode.window.registerTreeDataProvider(treeId, new VSCodeTreeProvider(treeId, trees[treeId]))
    })
  }

  // Commands
  if(typeof params.commands !== "undefined") {
    registerCommands(params.commands)
  }
}
