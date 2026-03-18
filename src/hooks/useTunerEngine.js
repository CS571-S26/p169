import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { centsOff, noteToFrequency } from '../utils/music.js'

function getRms(buffer) {
    let sum = 0
    for (let i = 0; i < buffer.length; i += 1) {
        const value = buffer[i]
        sum += value * value
    }
    return Math.sqrt(sum / buffer.length)
}

function autoCorrelate(buffer, sampleRate) {
    const rms = getRms(buffer)

    if (rms < 0.006) {
        return null
    }

    const SIZE = buffer.length
    let start = 0
    let end = SIZE - 1
    const threshold = 0.2

    while (start < SIZE / 2 && Math.abs(buffer[start]) < threshold) {
        start += 1
    }

    while (end > SIZE / 2 && Math.abs(buffer[end]) < threshold) {
        end -= 1
    }

    const clipped = buffer.slice(start, end)
    if (clipped.length < 32) {
        return null
    }

    const correlations = new Array(clipped.length).fill(0)
    for (let lag = 0; lag < clipped.length; lag += 1) {
        let sum = 0
        for (let i = 0; i < clipped.length - lag; i += 1) {
            sum += clipped[i] * clipped[i + lag]
        }
        correlations[lag] = sum
    }

    let dip = 0
    while (dip < correlations.length - 1 && correlations[dip] > correlations[dip + 1]) {
        dip += 1
    }

    let bestLag = -1
    let bestValue = -Infinity
    for (let i = dip; i < correlations.length; i += 1) {
        if (correlations[i] > bestValue) {
            bestValue = correlations[i]
            bestLag = i
        }
    }

    if (bestLag <= 0) {
        return null
    }

    const prev = correlations[bestLag - 1] ?? correlations[bestLag]
    const center = correlations[bestLag]
    const next = correlations[bestLag + 1] ?? correlations[bestLag]
    const a = (prev + next - 2 * center) / 2
    const b = (next - prev) / 2
    const correctedLag = a ? bestLag - b / (2 * a) : bestLag

    const hz = sampleRate / correctedLag
    if (!Number.isFinite(hz) || hz < 50 || hz > 1400) {
        return null
    }

    return hz
}

export function useTunerEngine(tuning) {
    const [isListening, setIsListening] = useState(false)
    const [detectedHz, setDetectedHz] = useState(null)
    const [activeString, setActiveString] = useState(null)
    const [signalLevel, setSignalLevel] = useState(0)
    const [error, setError] = useState('')

    const contextRef = useRef(null)
    const streamRef = useRef(null)
    const analyserRef = useRef(null)
    const animationRef = useRef(null)
    const sampleRef = useRef(() => { })
    const silenceFramesRef = useRef(0)

    const notes = useMemo(() => {
        return (tuning?.notes || []).map((note, index) => ({
            note,
            stringNumber: index + 1,
            hz: noteToFrequency(note),
        }))
    }, [tuning?.notes])

    const sample = useCallback(() => {
        const analyser = analyserRef.current
        const audioContext = contextRef.current

        if (!analyser || !audioContext) {
            return
        }

        const buffer = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(buffer)
        const rms = getRms(buffer)
        setSignalLevel(Math.min(rms * 9, 1))

        const hz = autoCorrelate(buffer, audioContext.sampleRate)
        if (!hz) {
            silenceFramesRef.current += 1
            if (silenceFramesRef.current > 6) {
                setDetectedHz(null)
                setActiveString(null)
            }
            animationRef.current = requestAnimationFrame(sampleRef.current)
            return
        }

        silenceFramesRef.current = 0

        setDetectedHz(hz)

        let best = null
        for (const item of notes) {
            if (!item.hz) {
                continue
            }

            const cents = centsOff(hz, item.hz)
            const distance = Math.abs(cents)

            if (!best || distance < best.distance) {
                best = {
                    note: item.note,
                    stringNumber: item.stringNumber,
                    targetHz: item.hz,
                    cents,
                    distance,
                }
            }
        }

        if (best) {
            setActiveString(best)
        }

        animationRef.current = requestAnimationFrame(sampleRef.current)
    }, [notes])

    useEffect(() => {
        sampleRef.current = sample
    }, [sample])

    const stop = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop()
            }
            streamRef.current = null
        }

        if (contextRef.current) {
            contextRef.current.close()
            contextRef.current = null
        }

        analyserRef.current = null
        setIsListening(false)
        setSignalLevel(0)
        setDetectedHz(null)
        setActiveString(null)
    }, [])

    const start = useCallback(async () => {
        setError('')

        if (!navigator.mediaDevices?.getUserMedia) {
            setError('This browser does not support microphone access.')
            return
        }

        try {
            if (isListening) {
                stop()
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (!AudioContextClass) {
                setError('AudioContext is not available in this browser.')
                return
            }

            const audioContext = new AudioContextClass()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 2048
            analyser.smoothingTimeConstant = 0.2

            source.connect(analyser)

            streamRef.current = stream
            contextRef.current = audioContext
            analyserRef.current = analyser

            setDetectedHz(null)
            setActiveString(null)
            setIsListening(true)
            animationRef.current = requestAnimationFrame(sampleRef.current)
        } catch {
            setError('Microphone permission was blocked. Check browser settings and retry.')
        }
    }, [isListening, stop])

    useEffect(() => stop, [stop])

    return {
        isListening,
        detectedHz,
        activeString,
        signalLevel,
        start,
        stop,
        error,
    }
}
