'use client'

import { Button } from 'react-bootstrap'

export function StringSelectorPanel({ tuningStrings, targetIndex, setTargetIndex }) {
    const topRow = tuningStrings.slice(0, 3)
    const bottomRow = tuningStrings.slice(3, 6)

    return (
        <div className="tuner-orbit-card tuner-orbit-left">
            <div className="d-flex flex-column align-items-center justify-content-center text-center h-100 w-100">
                <div className="fw-semibold mb-2">Pick a string</div>
                <div className="string-selector-grid">
                    <div className="string-selector-row">
                        {topRow.map((item, index) => (
                            <Button
                                key={item.stringName}
                                type="button"
                                variant={index === targetIndex ? 'dark' : 'outline-dark'}
                                className={`tuner-mini-chip string-selector-chip ${index === targetIndex ? 'is-active' : ''}`}
                                onClick={() => setTargetIndex(index)}
                            >
                                {item.note}
                            </Button>
                        ))}
                    </div>
                    <div className="string-selector-row">
                        {bottomRow.map((item, index) => {
                            const stringIndex = index + 3
                            return (
                                <Button
                                    key={item.stringName}
                                    type="button"
                                    variant={stringIndex === targetIndex ? 'dark' : 'outline-dark'}
                                    className={`tuner-mini-chip string-selector-chip ${stringIndex === targetIndex ? 'is-active' : ''}`}
                                    onClick={() => setTargetIndex(stringIndex)}
                                >
                                    {item.note}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
