import vscode from "vscode"

export type VSCodeTaskProvider = {
  type: string
  provideTasks: (type: string) => Promise<vscode.Task[]>
}
