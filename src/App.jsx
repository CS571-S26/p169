import { useMemo, useState } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import { useTunings } from './contexts/TuningContext.jsx'
import { TunerPanel } from './components/TunerPanel.jsx'
import { TuningLibraryPanel } from './components/TuningLibraryPanel.jsx'
import { AccountPanel } from './components/AccountPanel.jsx'

function App() {
  const [activeView, setActiveView] = useState('tuner')
  const { user } = useAuth()
  const { activeTuning } = useTunings()

  const subtitle = useMemo(() => {
    if (!user) {
      return 'Sign in to save custom tunings and sync your setup later.'
    }

    return `Signed in as ${user.displayName} | Active tuning: ${activeTuning?.name ?? 'None'}`
  }, [activeTuning?.name, user])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">WIP</p>
          <h1>TunedUp</h1>
          <p className="subhead">{subtitle}</p>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            type="button"
            className={activeView === 'tuner' ? 'nav-btn is-active' : 'nav-btn'}
            onClick={() => setActiveView('tuner')}
          >
            Tuner
          </button>
          <button
            type="button"
            className={activeView === 'tunings' ? 'nav-btn is-active' : 'nav-btn'}
            onClick={() => setActiveView('tunings')}
          >
            Tunings
          </button>
          <button
            type="button"
            className={activeView === 'account' ? 'nav-btn is-active' : 'nav-btn'}
            onClick={() => setActiveView('account')}
          >
            Account
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === 'tuner' && <TunerPanel />}
        {activeView === 'tunings' && <TuningLibraryPanel />}
        {activeView === 'account' && <AccountPanel />}
      </main>
    </div>
  )
}

export default App
