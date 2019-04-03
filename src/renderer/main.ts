import "./patches/AdaptiveLazyChannels"

require("./old-core/twitchcord").load();

// function DFS(_node: HTMLElement, getChildren: (node: any) => any[], callback: (node: any) => any) {
//   const queue = [_node]
//   const found = []
//   while (queue.length > 0) {
//     const node = queue.pop()
//     const ret = callback(node)
//     if (ret) found.push(ret)

//     queue.push(...getChildren(node))
//   }
//   return found
// }
// function getOwner(internalInstance: any) {
//   while (!(internalInstance.stateNode instanceof React.Component || internalInstance.stateNode instanceof React.PureComponent)) {
//     internalInstance = internalInstance.return
//   }
//   return internalInstance.stateNode
// }
// DFS(document.documentElement, node => node.children, node => {
//   const found = Object.entries(node).find(([k]) => k.startsWith("__reactInternalInstance"))
//   if (!found) return
//   const internalInstance = found[1]
//   const owner = getOwner(internalInstance)
//   const component = owner.constructor
//   return component.displayName === "Channels" && [node, internalInstance, owner, component]
// })[0]
