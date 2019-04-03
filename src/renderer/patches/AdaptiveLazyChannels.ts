let CHANNEL_HEIGHT = 34;

const WaitForTruthy = <R>(
  cb: (...args: any[]) => R,
  delay: number
): Promise<R> =>
  new Promise(res =>
    setTimeout(() => res(cb() || WaitForTruthy(cb, delay)), delay)
  );

WaitForTruthy(() => {
  const tc = (global as any)["tc"];
  return tc && tc.webpack ? tc : false;
}, 200).then(tc =>
  WaitForTruthy(() => tc.webpack.findByDisplayName("Channels"), 200).then(
    Channels => {
      const Constants = tc.webpack.findByUniqueProperties(["ChannelTypes"]);
      const ChannelUtil = tc.webpack.findByUniqueProperties([
        "isChannelCollapsed"
      ]);
      const Storage = tc.webpack.findByUniqueProperties(["ObjectStorage", "impl"]).impl
      CHANNEL_HEIGHT = Storage.get("FOUND_CHANNEL_HEIGHT") || CHANNEL_HEIGHT
      const _render = Channels.prototype.render;
      let _getRowHeight: Function;
      function render(...args: any[]) {
        this.getRowHeight = _getRowHeight.bind(this);
        return _render.call(this, ...args);
      }
      Channels.prototype.render = function PhaseOne(...args: any[]) {
        _getRowHeight = function(t: number, index: number = 0) {
          const e = this;
          let props = e.props;
          let channels = props.channels;
          let collapsedChannels = props.collapsedChannels;
          let voiceStates = props.voiceStates;
          let categories = props.categories;
          let _channel = channels[Constants.ChannelTypes.GUILD_CATEGORY][t];
          let height = CHANNEL_HEIGHT
          let f = _channel
            ? categories[_channel.channel.id][index]
            : categories.null[index];
          if (null === f) return 0;
          var channel = f.channel;
          if (ChannelUtil.isChannelCollapsed(channel)) return 0;
          switch (channel.type) {
            case Constants.ChannelTypes.GUILD_VOICE:
              var p = voiceStates[channel.id];
              if (null != p && p.length > 0) {
                var h = 28 * p.length;
                channel && collapsedChannels[channel.id] && (h = Math.ceil(h / 6)),
                  (height += h + 8);
              }
          }
          return height;
        };
        Channels.prototype.render = render;
        const Rendered = this.render(...args);
        WaitForTruthy(
          () => Rendered.props.children[1]._owner.return.stateNode,
          200
        )
          .then(el =>
            WaitForTruthy(() => el.querySelector("[class^=wrapper]"), 200)
          )
          .then(el => (console.log("Doin it"), Storage.set("FOUND_CHANNEL_HEIGHT", CHANNEL_HEIGHT = parseInt(getComputedStyle(el).height))));
        return Rendered;
      };
    }
  )
);