import { CatalogTreeContext } from "./context"

export type CatalogTreeHandler = {
  users: (context: CatalogTreeContext) => VSCodeTreeData[]
  companies: (context: CatalogTreeContext) => VSCodeTreeData[]
  groups: (context: CatalogTreeContext) => VSCodeTreeData[]
  projects: (context: CatalogTreeContext) => VSCodeTreeData[]
  recipes: (context: CatalogTreeContext) => VSCodeTreeData[]
  secrets: (context: CatalogTreeContext) => VSCodeTreeData[]
  values: (context: CatalogTreeContext) => VSCodeTreeData[]
}
