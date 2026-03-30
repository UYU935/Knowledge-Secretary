import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
          style={{ background: '#1a1410', color: '#f0e6d3' }}>
          <p className="text-4xl mb-4">⚠️</p>
          <h2 style={{ color: '#c8a96e', fontSize: '18px', marginBottom: '12px' }}>エラーが発生しました</h2>
          <p style={{ color: '#a89880', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#c8a96e', color: '#1a1410', border: 'none',
              borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            再読み込み
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
