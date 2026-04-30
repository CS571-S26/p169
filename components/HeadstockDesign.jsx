'use client'

import { Button } from 'react-bootstrap'

const MACHINE_HEAD_POSITIONS = [
    { side: 'left', left: '15%', top: '25%' },
    { side: 'left', left: '15%', top: '50%' },
    { side: 'left', left: '15%', top: '75%' },
    { side: 'right', left: '85%', top: '25%' },
    { side: 'right', left: '85%', top: '50%' },
    { side: 'right', left: '85%', top: '75%' },
]

export function HeadstockDesign({
    tuningStrings,
    targetIndex,
    setTargetIndex,
    isListening,
    start,
    stop,
    heardString,
    tunerColor,
    markerOffset,
    isTuneLocked,
}) {
    return (
        <div className="tuner-headstock-stage">
            <div className="tuner-neck" />
            <div className="tuner-headstock">
                {/* Guitar headstock SVG from game-icons.net (CC BY 3.0) */}
                <svg
                    className="tuner-headstock-svg"
                    viewBox="0 0 512 512"
                >
                    <defs>
                        <linearGradient id="headstockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#dcdfe8" />
                            <stop offset="100%" stopColor="#c5c9d8" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#headstockGradient)"
                        stroke="#9a9fb0"
                        strokeWidth="2"
                        d="M152.6 26.32L137.2 441.9 256 486.4l118.8-44.5-15.4-415.58L256 41.09 152.6 26.32zM64 89c-36 0-36 78 0 78h9.51l13-39-13-39H64zm374.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 112a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-217.6 7l2.1 6.2 1 2.8-3 9h28l.7-18h-28.8zm278.4 0l.7 18h28.1l-2.1-6.2-1-2.8 3-9h-28.7zM60 217c-36 0-36 78 0 78h9.51l13-39-13-39H60zm382.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 240a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-221.56 7l2.06 6.2 1 2.8-3 9h27.3l.7-18H98.44zm287.06 0l.7 18h27.4l-2.1-6.2-1-2.8 3-9h-28zM56 345c-36 0-36 78 0 78h9.51l13-39-13-39H56zm390.5 0l-13 39 13 39h9.5c36 0 36-78 0-78h-9.5zM192 368a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm128 0a16 16 0 0 1 16 16 16 16 0 0 1-16 16 16 16 0 0 1-16-16 16 16 0 0 1 16-16zm-225.53 7l2.07 6.2.95 2.8-3 9h26.61l.6-18H94.47zm295.83 0l.6 18h26.7l-2.1-6.2-1-2.8 3-9h-27.2z"
                    />
                </svg>

                <div className="tuner-headstock-center">
                    <div className={`tuner-lock-ring ${isTuneLocked ? 'is-locked' : ''}`} />

                    <div className="tuner-headstock-core-shell" />

                    <div
                        className={`tuner-core ${isTuneLocked ? 'is-locked' : ''}`}
                        style={{
                            borderColor: tunerColor,
                            backgroundColor: tunerColor,
                            transform: `translateX(${markerOffset}px)`,
                        }}
                    >
                        {heardString ? heardString.name : '--'}
                    </div>

                    {isTuneLocked ? <div className="tuner-lock-text">LOCKED</div> : null}
                </div>

                {tuningStrings.map((item, index) => {
                    const slot = MACHINE_HEAD_POSITIONS[index]
                    const isActive = index === targetIndex
                    return (
                        <Button
                            key={item.stringName}
                            variant={isActive ? 'dark' : 'outline-dark'}
                            className={`machine-head-button ${slot.side} ${isActive ? 'is-active' : ''}`}
                            style={{ top: slot.top, left: slot.left, transform: 'translate(-50%, -50%)' }}
                            onClick={() => setTargetIndex(index)}
                            aria-label={`${item.stringName} ${item.note}`}
                        >
                            <span className="machine-head-note">{item.note}</span>
                            <span className="machine-head-label">{item.stringName}</span>
                        </Button>
                    )
                })}
            </div>

            <div className="headstock-listen-control">
                <Button
                    variant={isListening ? 'danger' : 'dark'}
                    onClick={() => {
                        if (isListening) {
                            stop()
                        } else {
                            start()
                        }
                    }}
                    className="px-4"
                >
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </Button>
            </div>
        </div>
    )
}
