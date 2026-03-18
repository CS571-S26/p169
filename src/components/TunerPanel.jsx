import { useMemo } from 'react'
import { useTunings } from '../contexts/TuningContext.jsx'
import { useTunerEngine } from '../hooks/useTunerEngine.js'
import { clamp } from '../utils/music.js'

export function TunerPanel() {
    const { activeTuning } = useTunings()
    const { isListening, detectedHz, activeString, signalLevel, start, stop, error } = useTunerEngine(activeTuning)

    const direction = useMemo(() => {
        if (!activeString) {
            return 'idle'
        }

        if (Math.abs(activeString.cents) <= 5) {
            return 'in-tune'
        }

        return activeString.cents > 0 ? 'sharp' : 'flat'
    }, [activeString])

    const orbScale = useMemo(() => clamp(0.9 + signalLevel * 0.9, 0.9, 1.8), [signalLevel])

    const directionText = useMemo(() => {
        if (!activeString) {
            return 'No stable pitch yet.'
        }

        if (direction === 'in-tune') {
            return 'In tune. Hold that pitch.'
        }

        if (direction === 'sharp') {
            return 'Pitch is high. Tune down (lower).'
        }

        return 'Pitch is low. Tune up (higher).'
    }, [activeString, direction])

    return (
        <section className="panel" aria-live="polite">
            <h2>Live Tuner</h2>
            <p className="panel-intro">
                Active tuning: <strong>{activeTuning?.name || 'None'}</strong>
            </p>
            <p className={isListening ? 'status-chip live' : 'status-chip off'}>
                {isListening ? 'Listening for pitch...' : 'Microphone idle'}
            </p>

            <div className="actions-row">
                <button type="button" className="primary-btn" onClick={start} disabled={isListening}>
                    Start Listening
                </button>
                <button type="button" className="secondary-btn" onClick={stop} disabled={!isListening}>
                    Stop
                </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="tuner-visual-wrap">
                <div
                    className={`tuner-orb ${direction} ${isListening ? 'is-live' : ''}`}
                    role="img"
                    aria-label="Tuning status orb"
                    style={{ '--orb-scale': orbScale }}
                >
                    <span className="orb-note">{activeString?.note || '--'}</span>
                </div>
                <p className="meter-readout">{directionText}</p>
            </div>

            <div className="tuner-stats grid two">
                <p className="meter-readout">
                    Heard: {detectedHz ? `${detectedHz.toFixed(2)} Hz` : '--'}
                </p>
                <p className="meter-readout">
                    String guess:{' '}
                    {activeString ? `String ${activeString.stringNumber} (${activeString.note})` : '--'}
                </p>
                <p className="meter-readout">
                    Target: {activeString ? `${activeString.targetHz.toFixed(2)} Hz` : '--'}
                </p>
                <p className="meter-readout">
                    Offset: {activeString ? `${activeString.cents.toFixed(1)} cents` : '--'}
                </p>
            </div>
        </section>
    )
}
