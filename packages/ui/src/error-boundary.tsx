'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StatusScreen } from './status-screen'
import type { Messages } from './i18n'

type Props = { children: ReactNode; messages?: Messages }
type State = { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return <StatusScreen kind="error" messages={this.props.messages} onRetry={() => this.setState({ failed: false })} />
    }
    return this.props.children
  }
}
