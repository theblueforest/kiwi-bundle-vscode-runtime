import { TreeObject } from "dropin-recipes"

type RecipeQuery = any

export interface VSCodeTreeData<LabelType = string|RecipeQuery> {
  label: LabelType
}

export type VSCodeTreeObject = TreeObject<any>
