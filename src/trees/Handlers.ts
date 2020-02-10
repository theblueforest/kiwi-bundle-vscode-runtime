import { KeysObject } from "dropin-recipes"
import { VSCodeTreeData, VSCodeTreeProvider } from "./Provider"
import { VSCodeTreeItem } from "./Item"

type ItemHandler<Context> = (context: Context, path?: string[]) => VSCodeTreeData[]

type CommandHandler<Context> = (context: Context, item?: VSCodeTreeItem) => void

type CommandsHandlers<Context, Commands> = KeysObject<CommandHandler<Context>, Commands>

interface Params<Context, Commands> {
  items?: KeysObject<ItemHandler<Context>>
  commands?: CommandsHandlers<Context, Commands>
  onItems?: (items: VSCodeTreeItem[], depth: number) => VSCodeTreeItem[]
  init?: (provider: VSCodeTreeProvider, context: Context) => void
}

export interface VSCodeTreeHandlers<Context = {}, Commands = {}> {
  runItemHandler(name: string, path?: string[]): VSCodeTreeData[]
  loadAllItems(): void
  runCommandHandler(name: keyof Commands): void
  registerCommands(register: (name: string, command: (...params: any[]) => void) => void): void
  getContext(): Context
  onItems: (items: VSCodeTreeItem[], depth: number) => VSCodeTreeItem[]
  init(provider: VSCodeTreeProvider): void
}

export const VSCodeTreeHandlers = <Context extends KeysObject<any> = {}>(context: Context = {} as Context) => {
  return <Commands extends CommandsHandlers<Context, Commands>>(params: Params<Context, Commands>) => {
    const items = params.items || {}
    const commands = params.commands || {} as Commands
    return ({
      runItemHandler: (name, path) => {
        const output = items[name]
        if(typeof output !== "undefined") {
          return output(context, path)
        }
        return []
      },
      loadAllItems: () => Object.values(items).forEach(item => (item as ItemHandler<Context>)(context)),
      runCommandHandler: name => commands[name](context),
      registerCommands: register => {
        Object.keys(commands).forEach(commandName => {
          register(commandName, itemPath => commands[commandName as keyof Commands](context, itemPath))
        })
      },
      getContext: () => context,
      onItems: (items, depth) => typeof params.onItems !== "undefined" ? params.onItems(items, depth) : items,
      init: provider => {
        if(typeof params.init !== "undefined") {
          params.init(provider, context)
        }
      },
    }) as VSCodeTreeHandlers<Context, Commands>
  }
}
