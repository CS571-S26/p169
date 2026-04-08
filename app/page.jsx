'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, ButtonGroup, Form } from 'react-bootstrap'
import { STRING_ORDER, getTuningStrings, loadSelectedNotes } from '../utils/tuningSettings.js'

function centsOff(current, target) {
    return 1200 * Math.log2(current / target)
}

function autoCorrelate(buffer, sampleRate) {
    let rms = 0
    for (let i = 0; i < buffer.length; i += 1) {
        rms += buffer[i] * buffer[i]
    }
    rms = Math.sqrt(rms / buffer.length)
    if (rms < 0.006) {
        return null
    }

    const size = buffer.length
    let best = -1
    let bestCorr = 0
    for (let offset = 8; offset < size / 2; offset += 1) {
        let diff = 0
        for (let i = 0; i < size - offset; i += 1) {
            diff += Math.abs(buffer[i] - buffer[i + offset])
        }
        const corr = 1 - diff / (size - offset)
        if (corr > bestCorr) {
            bestCorr = corr
            best = offset
        }
    }

    if (best < 0 || bestCorr < 0.82) {
        return null
    }

    const hz = sampleRate / best
    if (!Number.isFinite(hz) || hz < 50 || hz > 1200) {
        return null
    }

    return hz
}

function foldIntoGuitarRange(hz) {
    if (!hz) {
        return hz
    }

    let next = hz
    while (next > 370) {
        next /= 2
    }
    while (next < 70) {
        next *= 2
    }
    return next
}

function getRms(buffer) {
    let rms = 0
    for (let i = 0; i < buffer.length; i += 1) {
        rms += buffer[i] * buffer[i]
    }
    return Math.sqrt(rms / buffer.length)
}

export default function HomePage() {
    const [targetIndex, setTargetIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [detectedHz, setDetectedHz] = useState(null)
    const [signalLevel, setSignalLevel] = useState(0)
    const [error, setError] = useState('')
    const [selectedNotes, setSelectedNotes] = useState(() => loadSelectedNotes())

    const contextRef = useRef(null)
    const streamRef = useRef(null)
    const analyserRef = useRef(null)
    const rafRef = useRef(null)
    const silentFramesRef = useRef(0)
    const holdFramesRef = useRef(0)

    const tuningStrings = useMemo(() => getTuningStrings(selectedNotes), [selectedNotes])
    const target = tuningStrings[targetIndex]

    useEffect(() => {
        const handleStorage = () => {
            setSelectedNotes(loadSelectedNotes())
        }

        window.addEventListener('storage', handleStorage)
        window.addEventListener('tuning-settings-updated', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('tuning-settings-updated', handleStorage)
        }
    }, [])

    const cents = useMemo(() => {
        if (!detectedHz) {
            return null
        }
        return centsOff(detectedHz, target.hz)
    }, [detectedHz, target.hz])

    const heardString = useMemo(() => {
        if (!detectedHz) {
            return null
        }

        let best = null
        for (const item of tuningStrings) {
            const diff = Math.abs(centsOff(detectedHz, item.hz))
            if (!best || diff < best.diff) {
                best = { ...item, diff }
            }
        }

        return best
    }, [detectedHz, tuningStrings])

    const tuneStatus = useMemo(() => {
        if (cents === null) {
            return 'waiting'
        }
        if (Math.abs(cents) <= 8) {
            return 'in tune'
        }
        return cents > 0 ? 'too high' : 'too low'
    }, [cents])

    const absCents = cents === null ? null : Math.abs(cents)
    const closeness = absCents === null ? 0 : Math.max(0, 1 - absCents / 90)
    const hue = Math.round(0 + closeness * 135)
    const innerScale = 0.95 + signalLevel * 0.45
    const outerScale = 1.05 + signalLevel * 0.6
    const markerOffset = cents === null ? 0 : Math.max(-34, Math.min(34, cents * 0.55))

    const stop = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (contextRef.current) {
            contextRef.current.close()
            contextRef.current = null
        }
        analyserRef.current = null
        setIsListening(false)
        setSignalLevel(0)
    }

    const sample = () => {
        const analyser = analyserRef.current
        const ctx = contextRef.current
        if (!analyser || !ctx) {
            return
        }

        const buffer = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(buffer)
        const rms = getRms(buffer)
        setSignalLevel((prev) => prev * 0.82 + Math.min(rms * 8, 1) * 0.18)

        const hzRaw = autoCorrelate(buffer, ctx.sampleRate)
        const hz = foldIntoGuitarRange(hzRaw)
        if (hz) {
            silentFramesRef.current = 0
            holdFramesRef.current = 180
            setDetectedHz((prev) => (prev ? prev * 0.8 + hz * 0.2 : hz))
        } else {
            silentFramesRef.current += 1
            if (holdFramesRef.current > 0) {
                holdFramesRef.current -= 1
            }
            if (silentFramesRef.current > 180 && holdFramesRef.current === 0) {
                setDetectedHz(null)
            }
        }

        rafRef.current = requestAnimationFrame(sample)
    }

    const start = async () => {
        setError('')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (!AudioContextClass) {
                setError('Audio not supported')
                return
            }

            const ctx = new AudioContextClass()
            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 4096
            analyser.smoothingTimeConstant = 0.3
            source.connect(analyser)

            streamRef.current = stream
            contextRef.current = ctx
            analyserRef.current = analyser
            setIsListening(true)
            sample()
        } catch {
            setError('Could not use microphone')
        }
    }

    useEffect(() => stop, [])

    return (
        <section className="rounded-4 border border-stone-300 bg-white p-4 shadow-sm grid gap-3">
            <h1 className="text-2xl font-semibold">Tuner</h1>

            <div>
                <p className="mb-2 text-stone-600">Pick string</p>
                <ButtonGroup className="flex flex-wrap gap-2">
                    {tuningStrings.map((item, index) => (
                        <Button
                            key={item.stringName}
                            variant={index === targetIndex ? 'dark' : 'outline-dark'}
                            onClick={() => setTargetIndex(index)}
                        >
                            {item.note}
                        </Button>
                    ))}
                </ButtonGroup>
                <div className="mt-2 text-sm text-stone-500">
                    {tuningStrings.map((item) => `${item.stringName} → ${item.note}`).join(' | ')}
                </div>
            </div>

            <div className="grid gap-2 rounded-4 border border-stone-200 bg-stone-50 p-3">
                <div className="d-flex justify-content-center py-2">
                    <div
                        style={{
                            width: 156,
                            height: 156,
                            borderRadius: '999px',
                            border: `3px solid hsl(${hue} 78% 43%)`,
                            transform: `scale(${outerScale})`,
                            transition: 'transform 120ms linear, border-color 160ms ease',
                            display: 'grid',
                            placeItems: 'center',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                width: 112,
                                height: 112,
                                borderRadius: '999px',
                                background: `hsl(${hue} 78% 43%)`,
                                color: 'white',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '1.55rem',
                                transform: `scale(${innerScale})`,
                                transition: 'transform 90ms linear, background-color 160ms ease',
                                position: 'relative',
                            }}
                        >
                            {heardString ? heardString.name : '--'}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-14px',
                                    left: '50%',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '999px',
                                    background: 'white',
                                    border: `2px solid hsl(${hue} 78% 43%)`,
                                    transform: `translateX(calc(-50% + ${markerOffset}px))`,
                                    transition: 'transform 120ms linear, border-color 160ms ease',
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div>Target: {target.stringName} ({target.note} - {target.hz.toFixed(2)} Hz)</div>
                <div>Detected: {detectedHz ? `${detectedHz.toFixed(2)} Hz` : '--'}</div>
                <div>Heard string: {heardString ? `${heardString.stringName} (${heardString.note})` : '--'}</div>
                <div>Status: {tuneStatus}</div>
                <div>Offset: {cents === null ? '--' : `${cents.toFixed(1)} cents`}</div>
            </div>

            <Form.Check
                type="switch"
                id="listen-switch"
                label={isListening ? 'Listening' : 'Not listening'}
                checked={isListening}
                onChange={(event) => {
                    if (event.target.checked) {
                        start()
                    } else {
                        stop()
                    }
                }}
            />

            {error ? <p className="text-danger mb-0">{error}</p> : null}

            <div>
                <Button variant="outline-secondary" onClick={stop}>
                    Stop
                </Button>
            </div>
        </section>
    )
}
