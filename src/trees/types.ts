import { TreeObject, i18nQuery } from "dropin-recipes"

export type VSCodeTreeRecipeData = {
  label: string | i18nQuery
}

type VSCodeTreeRecipeDataObject = TreeObject<VSCodeTreeRecipeData | {
  $: { type: "handler", name: string }
}>

export type VSCodeTreeRecipe = VSCodeTreeRecipeDataObject[]

export type VSCodeTreeHandlers = {
  [functionName: string]: ((context: any) => any)|VSCodeTreeHandlers
}
