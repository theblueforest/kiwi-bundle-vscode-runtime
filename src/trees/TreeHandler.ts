
export type VSCodeTreeHandler = {
  [functionName: string]: ((context: any) => any)|VSCodeTreeHandler
}
