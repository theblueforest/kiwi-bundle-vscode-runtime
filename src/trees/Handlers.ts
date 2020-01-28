import { VSCodeTreeData } from "./Provider"

type TreeHandlers = { [name: string]: () => VSCodeTreeData[] }

type Command<Context> = (context: Context) => void

type Commands<Context> = { [name: string]: Command<Context> }

export class VSCodeTreeHandlers<Context = any> {
  private context: Context = {} as any

  constructor(private treeHandlers: TreeHandlers, private commands?: Commands<Context>) {}

  run(handlerName: string): VSCodeTreeData[] {
    return this.treeHandlers[handlerName]()
  }

  handleCommands(register: (name: string, command: Command<Context>) => void) {
    if(typeof this.commands !== "undefined") {
      Object.keys(this.commands).forEach(commandName => {
        register(commandName, (this.commands as Commands<Context>)[commandName])
      })
    }
  }

}
