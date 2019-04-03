// TODO:
// Proper dependencies - const { Channels, ChannelItem } = require("discord-components")
// This also needs to access the modules before other dependencies - Module.load("discord-components", -1) might work

const NATIVE_CHANNEL_HEIGHT = 34
let CHANNEL_HEIGHT = NATIVE_CHANNEL_HEIGHT;

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
export async function waitForTruthy<R>(cb: (...args: any[]) => R, delay: number = 200): Promise<R> {
  try {
    const val = cb()
    if (val) return val
  } catch {}
  return await wait(delay).then(() => waitForTruthy(cb, delay))
}

waitForTruthy(() => (window as any).tc.webpack.findByDisplayName("Channels")).then(Channels => {
  Object.defineProperty(Channels.prototype, "getRowHeight", {
    set: function(value) {
      Object.defineProperty(this, "getRowHeight", {
        configurable: true,
        enumerable: true,
        value: function(...args: any[]) {
          const ret = value(...args)
          return ret === 0 ? 0 : ret === NATIVE_CHANNEL_HEIGHT ? CHANNEL_HEIGHT : ret - NATIVE_CHANNEL_HEIGHT + CHANNEL_HEIGHT
        }
      })
    }
  })
});
waitForTruthy(() => (window as any).tc.webpack.findByDisplayName("ChannelItem")).then(ChannelItem => {
  const _render = ChannelItem.prototype.render
  ChannelItem.prototype.render = function(...args: any[]) {
    ChannelItem.prototype.render = _render
    const rendered = this.render(...args)
    rendered.ref = function(stateNode: { ref: HTMLElement }) {
      if (!stateNode) return
      CHANNEL_HEIGHT = parseInt(getComputedStyle(stateNode.ref).height)
    }
    return rendered
  }
})

