'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getTuningStrings, loadSelectedNotes } from '../utils/tuningSettings.js'
import { HeadstockDesign } from '../components/HeadstockDesign.jsx'
import { StringSelectorPanel } from '../components/StringSelectorPanel.jsx'
import { centsOff, detectPitch, foldIntoGuitarRange, getRms } from '../utils/pitchDetection.js'

export default function HomePage() {
    const LOCK_THRESHOLD_FRAMES = 18

    const [targetIndex, setTargetIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [detectedHz, setDetectedHz] = useState(null)
    const [signalLevel, setSignalLevel] = useState(0)
    const [error, setError] = useState('')
    const [isTuneLocked, setIsTuneLocked] = useState(false)
    const [selectedNotes, setSelectedNotes] = useState(() => loadSelectedNotes())

    const contextRef = useRef(null)
    const streamRef = useRef(null)
    const analyserRef = useRef(null)
    const highpassRef = useRef(null)
    const lowpassRef = useRef(null)
    const bandpassRef = useRef(null)
    const rafRef = useRef(null)
    const silentFramesRef = useRef(0)
    const prevHzRef = useRef(null)
    const lockFramesRef = useRef(0)

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
            return {
                label: 'waiting',
                tone: 'waiting',
                range: 'Play a string to detect pitch',
            }
        }

        const abs = Math.abs(cents)
        if (abs <= 8) {
            return {
                label: isTuneLocked ? 'in tune (locked)' : 'in tune',
                tone: 'in-tune',
                range: isTuneLocked ? 'Pitch lock engaged' : 'Hold steady to lock pitch',
            }
        }

        if (abs <= 20) {
            return {
                label: cents > 0 ? 'a little high' : 'a little low',
                tone: 'near',
                range: 'Near range: 8 to 20 cents off',
            }
        }

        return {
            label: cents > 0 ? 'too high' : 'too low',
            tone: 'far',
            range: 'Far range: more than 20 cents off',
        }
    }, [cents, isTuneLocked])

    const absCents = cents === null ? null : Math.abs(cents)
    const closeness = absCents === null ? 0 : Math.max(0, 1 - absCents / 90)
    const hue = 264
    const saturation = Math.round(44 + closeness * 28)
    const lightness = Math.round(36 + closeness * 22)
    const tunerColor = `hsl(${hue} ${saturation}% ${lightness}%)`
    const markerOffset = cents === null ? 0 : Math.max(-70, Math.min(70, cents * 0.6))

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
        highpassRef.current = null
        lowpassRef.current = null
        bandpassRef.current = null
        lockFramesRef.current = 0
        setIsListening(false)
        setIsTuneLocked(false)
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

        const hzRaw = detectPitch(buffer, ctx.sampleRate)
        const hz = foldIntoGuitarRange(hzRaw)
        let isInTuneNow = false
        if (hz) {
            silentFramesRef.current = 0
            isInTuneNow = Math.abs(centsOff(hz, target.hz)) <= 8
            // Only update detected note if it's significantly different (new note detected)
            // Check if we have a previous note and if this is a different note
            const prevHz = prevHzRef.current
            if (prevHz === null) {
                // First detection
                prevHzRef.current = hz
                setDetectedHz(hz)
            } else {
                // Check if the new note is significantly different (more than 20 cents)
                const centsDiff = Math.abs(centsOff(hz, prevHz))
                if (centsDiff > 20) {
                    // New note detected
                    prevHzRef.current = hz
                    setDetectedHz(hz)
                } else {
                    // Same note, smooth the value
                    setDetectedHz((prev) => (prev ? prev * 0.85 + hz * 0.15 : hz))
                }
            }
        } else {
            silentFramesRef.current += 1
            // Hold the last detected note indefinitely
        }

        if (isInTuneNow) {
            lockFramesRef.current = Math.min(LOCK_THRESHOLD_FRAMES, lockFramesRef.current + 1)
        } else {
            lockFramesRef.current = Math.max(0, lockFramesRef.current - 2)
        }

        const nextLockState = lockFramesRef.current >= LOCK_THRESHOLD_FRAMES
        setIsTuneLocked((current) => (current === nextLockState ? current : nextLockState))

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

            // Filter chain to reduce environmental low-end rumble and high-end noise,
            // then emphasize the selected string's fundamental neighborhood.
            const highpass = ctx.createBiquadFilter()
            highpass.type = 'highpass'
            highpass.frequency.value = 65
            highpass.Q.value = 0.7

            const lowpass = ctx.createBiquadFilter()
            lowpass.type = 'lowpass'
            lowpass.frequency.value = 1200
            lowpass.Q.value = 0.7

            const bandpass = ctx.createBiquadFilter()
            bandpass.type = 'bandpass'
            bandpass.frequency.value = target.hz
            bandpass.Q.value = 2.2

            const analyser = ctx.createAnalyser()
            analyser.fftSize = 8192
            analyser.smoothingTimeConstant = 0.2

            source.connect(highpass)
            highpass.connect(lowpass)
            lowpass.connect(bandpass)
            bandpass.connect(analyser)

            streamRef.current = stream
            contextRef.current = ctx
            analyserRef.current = analyser
            highpassRef.current = highpass
            lowpassRef.current = lowpass
            bandpassRef.current = bandpass
            setIsListening(true)
            sample()
        } catch {
            setError('Could not use microphone')
        }
    }

    useEffect(() => {
        if (!isListening || !bandpassRef.current || !contextRef.current) {
            return
        }

        bandpassRef.current.frequency.setTargetAtTime(target.hz, contextRef.current.currentTime, 0.02)
    }, [isListening, target.hz])

    useEffect(() => stop, [])

    return (
        <section className="main-panel tuner-panel rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Tuner</h1>
                    <p className="text-stone-600 mb-0">String buttons sit on the guitar headstock.</p>
                </div>
                <div className="tuner-status-badge">{isListening ? 'Listening' : 'Ready'}</div>
            </div>

            <div className="tuner-scene">
                <StringSelectorPanel
                    tuningStrings={tuningStrings}
                    targetIndex={targetIndex}
                    setTargetIndex={setTargetIndex}
                />

                <HeadstockDesign
                    tuningStrings={tuningStrings}
                    targetIndex={targetIndex}
                    setTargetIndex={setTargetIndex}
                    isListening={isListening}
                    start={start}
                    stop={stop}
                    heardString={heardString}
                    tunerColor={tunerColor}
                    markerOffset={markerOffset}
                    isTuneLocked={isTuneLocked}
                />

                <div className="tuner-orbit-card tuner-orbit-bottom-left">
                    <div className="d-flex flex-column align-items-center justify-content-center text-center">
                        <div className="fw-semibold">Target</div>
                        <div className="small">
                            {target.stringName} ({target.note} - {target.hz.toFixed(2)} Hz)
                        </div>
                        <div className="mt-2 fw-semibold">Detected</div>
                        <div className="small">{detectedHz ? `${detectedHz.toFixed(2)} Hz` : '--'}</div>
                    </div>
                </div>

                <div className="tuner-orbit-card tuner-orbit-center">
                    <div className="d-flex flex-column align-items-center justify-content-center text-center">
                        <div className="fw-semibold">Status</div>
                        <div className={`status-pill status-pill-${tuneStatus.tone}`}>{tuneStatus.label}</div>
                        <div className="small text-stone-500 mt-1">{tuneStatus.range}</div>
                        <div className="mt-2 fw-semibold">Offset</div>
                        <div className="small">{cents === null ? '--' : `${cents.toFixed(1)} cents`}</div>
                    </div>
                </div>
            </div>

            <div className="text-stone-500 small">
                Heard string: {heardString ? `${heardString.stringName} (${heardString.note})` : '--'}
            </div>

            {error ? <p className="text-danger mb-0">{error}</p> : null}
        </section>
    )
}
