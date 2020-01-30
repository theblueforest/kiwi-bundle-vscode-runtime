import { KeysObject } from "dropin-recipes"
import { VSCodeTreeData, VSCodeTreeProvider } from "./Provider"

type ItemHandler<Context> = (context: Context) => VSCodeTreeData[]

type CommandHandler<Context> = (context: Context, ...params: any[]) => void

type CommandsHandlers<Context, Commands> = KeysObject<CommandHandler<Context>, Commands>

interface Params<Context, Commands> {
  items?: KeysObject<ItemHandler<Context>>
  commands?: CommandsHandlers<Context, Commands>
  init?: (provider: VSCodeTreeProvider, context: Context) => void
}

export interface VSCodeTreeHandlers<Context = {}, Commands = {}> {
  runItemHandler(name: string): VSCodeTreeData[]
  loadAllItems(): void
  runCommandHandler(name: keyof Commands): void
  registerCommands(register: (name: string, command: (...params: any[]) => void) => void): void
  getContext(): Context
  init(provider: VSCodeTreeProvider): void
}

export const VSCodeTreeHandlers = <Context extends KeysObject<any> = {}>(context: Context = {} as Context) => {
  return <Commands extends CommandsHandlers<Context, Commands>>(params: Params<Context, Commands>) => {
    const items = params.items || {}
    const commands = params.commands || {} as Commands
    return ({
      runItemHandler: name => {
        const output = items[name]
        if(typeof output !== "undefined") {
          return output(context)
        }
        return []
      },
      loadAllItems: () => Object.values(items).forEach(item => (item as ItemHandler<Context>)(context)),
      runCommandHandler: name => commands[name](context),
      registerCommands: register => {
        Object.keys(commands).forEach(commandName => {
          register(commandName, (...params) => commands[commandName as keyof Commands](context, ...params))
        })
      },
      getContext: () => context,
      init: (provider: VSCodeTreeProvider) => {
        if(typeof params.init !== "undefined") {
          params.init(provider, context)
        }
      },
    }) as VSCodeTreeHandlers<Context, Commands>
  }
}
