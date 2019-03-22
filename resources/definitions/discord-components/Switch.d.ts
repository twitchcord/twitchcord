
import { Component } from 'react'

declare class Switch extends Component {
  static displayName: "Switch"
  static Sizes: {
    DEFAULT: string
    MINI: string
  }
  static Themes: {
    DEFAULT: string
    CLEAR: string
  }
  static defaultProps: {
    theme: string
    size: string
  }
}
export = Switch
