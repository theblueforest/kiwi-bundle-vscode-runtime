import { VSCodeTreeObject } from "../../../../outside_modules/vscode/TreeRecipe"

export const CatalogTreeRecipe: VSCodeTreeObject = [
  {
    id: [
      "users",
      "companies",
    ],
    data: [
      { label: { $: { type: "i18n", id: "users", options: { count: 0 } } } },
      { label: { $: { type: "i18n", id: "companies", options: { count: 0 } } } },
    ],
    children: [
      {
        id: [
          "user",
          "company",
        ],
        data: [
          { $: { type: "handler", id: "users" } },
          { $: { type: "handler", id: "companies" } },
        ],
        children: [
          {
            id: "groups",
            data: { label: "${i18n.catalog.groups}" },
            children: [
              { id: "group", data: "${handlers.catalog.groups}" },
            ],
          },
          {
            id: "projects",
            data: { label: "${i18n.catalog.projects}" },
            children: [
              { id: "project", data: "${handlers.catalog.projects}" },
            ],
          },
          {
            id: "recipes",
            data: { label: "${i18n.catalog.recipes}" },
            children: [
              { id: "recipe", data: "${handlers.catalog.recipes}" },
            ],
          },
          {
            id: "secrets",
            data: { label: "${i18n.catalog.secrets}" },
            children: [
              { id: "secret", data: "${handlers.catalog.secrets}" },
            ],
          },
          {
            id: "values",
            data: { label: "${i18n.catalog.values}" },
            children: [
              { id: "value", data: "${handlers.catalog.values}" },
            ],
          },
        ],
      },
    ],
  },
]
