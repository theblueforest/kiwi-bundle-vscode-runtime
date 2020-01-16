import * as vscode from "vscode"
import { VSCodeTreeParams, VSCodeTreeDataProvider } from "./TreeDataProvider"

interface Params {
  trees?: { [treeId: string]: VSCodeTreeParams }
}

export const KiwiBundleVSCode = (params: Params) => {
  if(typeof params.trees !== "undefined") {
    const trees = params.trees
    Object.keys(trees).map(treeId => {
      vscode.window.registerTreeDataProvider(treeId, new VSCodeTreeDataProvider(trees[treeId]))
    })
  }
}
