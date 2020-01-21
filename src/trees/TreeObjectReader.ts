import { TreeObject } from "dropin-recipes"

type ConvertCallback<DataType, OutputType> = (id: string, data: DataType) => OutputType

export class TreeObjectReader {

  static convert<DataType, OutputType>(tree: TreeObject<DataType>, callback: ConvertCallback<DataType, OutputType>): Promise<OutputType[]> {
    if(!Array.isArray(tree)) return Promise.reject("Tree must be an array")
    return tree.reduce<Promise<OutputType[]>>((promise, current) => {
      if(typeof current.id === "undefined") {
        return Promise.reject("Id is missing")
      }

      if(typeof current.data === "undefined") {
        return Promise.reject("Data is missing")
      }

      const currentList: OutputType[] = []

      if(Array.isArray(current.id)) {
        if(!Array.isArray(current.data)) {
          return Promise.reject("Id must be a string or data an array")
        }
        if(current.id.length !== current.data.length) {
          return Promise.reject("Lengths are different on id and data")
        }
        current.id.forEach((currentId: any, index: any) => {
          currentList.push(callback(currentId, (current.data as DataType[])[index]))
        })
      } else if(!Array.isArray(current.data)) {
        currentList.push(callback(current.id, current.data as DataType))
      } else {
        return Promise.reject("Id must be an string if data is not an array")
      }

      return promise.then(list => {
        list.push(...currentList)
        return list
      })

    }, Promise.resolve([]))
  }

}
