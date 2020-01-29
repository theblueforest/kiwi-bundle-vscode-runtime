import { KeysObject } from "dropin-recipes"
import { VSCodeTreeData } from "./Provider"

type ItemHandler<Context> = (context: Context) => VSCodeTreeData[]

type CommandHandler<Context> = (context: Context) => void

type ItemsHandlers<Context, Items> = KeysObject<ItemHandler<Context>, Items>

type CommandsHandlers<Context, Commands> = KeysObject<CommandHandler<Context>, Commands>

interface Params<Context, Items, Commands> {
  items?: ItemsHandlers<Context, Items>
  commands?: CommandsHandlers<Context, Commands>
}

export interface VSCodeTreeHandlers<Context = {}, Items = {}, Commands = {}> {
  runItemHandler(name: keyof Items): VSCodeTreeData[]
  runItemHandlerFromString(name: string): VSCodeTreeData[]
  loadAllItems(): void
  runCommandHandler(name: keyof Commands): void
  registerCommands(register: (name: string, command: CommandHandler<Context>) => void): void
  getContext(): Context
}

export const VSCodeTreeHandlers = <Context extends KeysObject<any> = {}>(context: Context = {} as Context) => {
  return <Items extends ItemsHandlers<Context, Items>, Commands extends CommandsHandlers<Context, Commands>>(params: Params<Context, Items, Commands>) => {
    const items = params.items || {} as Items
    const commands = params.commands || {} as Commands
    return ({
      runItemHandler: name => items[name](context),
      runItemHandlerFromString: name => {
        const output = items[name as keyof Items]
        if(typeof output !== "undefined") {
          return output(context)
        }
        return []
      },
      loadAllItems: () => Object.values(items).forEach(item => (item as ItemHandler<Context>)(context)),
      runCommandHandler: name => commands[name](context),
      registerCommands: register => {
        Object.keys(commands).forEach(commandName => {
          register(commandName, commands[commandName as keyof Commands])
        })
      },
      getContext: () => context,
    }) as VSCodeTreeHandlers<Context, Items, Commands>
  }
}
