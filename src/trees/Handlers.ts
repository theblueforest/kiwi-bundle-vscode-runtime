import { VSCodeTreeData } from "./Provider"

type TreeHandlers = { [name: string]: () => VSCodeTreeData[] }

type Command<Context> = (context?: Context) => void

type Commands<Context> = { [name: string]: Command<Context> }

export class VSCodeTreeHandlers<Context = any> {
  private context: Context = {} as any

  constructor(private treeHandlers: TreeHandlers, private commands?: Commands<Context>) {}

  runTreeHandler(name: string): VSCodeTreeData[] {
    return this.treeHandlers[name]()
  }

  runCommand(name: string, context?: Context): any {
    if(typeof this.commands !== "undefined" && typeof this.commands[name] !== "undefined") {
      return this.commands[name](context)
    }
  }

  handleCommands(register: (name: string, command: Command<Context>) => void) {
    if(typeof this.commands !== "undefined") {
      Object.keys(this.commands).forEach(commandName => {
        register(commandName, (this.commands as Commands<Context>)[commandName])
      })
    }
  }

}
