import { KeysObject } from "dropin-recipes"
import { VSCodeTreeData } from "./Provider"

type ItemsHandlers<Context, Items> = KeysObject<(context: Context) => VSCodeTreeData[], Items>

type CommandsHandlers<Context, Commands> = KeysObject<(context: Context) => void, Commands>

interface Params<Context, Items, Commands> {
  items?: ItemsHandlers<Context, Items>
  commands?: CommandsHandlers<Context, Commands>
}

export interface VSCodeTreeHandlers<Context = {}, Items = {}, Commands = {}> {
  runItemHandler(name: keyof Items): VSCodeTreeData[]
  runItemHandlerFromString(name: string): VSCodeTreeData[]
  runCommandHandler(name: keyof Commands): void
  registerCommands(register: (name: string, command: (context: Context) => void) => void): void
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
      runCommandHandler: name => commands[name](context),
      registerCommands: register => {
        Object.keys(commands).forEach(commandName => {
          register(commandName, commands[commandName as keyof Commands])
        })
      },
    }) as VSCodeTreeHandlers<Context, Items, Commands>
  }
}
