const NOTE_OFFSETS = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
}

const NOTE_PATTERN = /^([A-G](?:#|b)?)(-?\d)$/

export function noteToFrequency(note) {
    const match = NOTE_PATTERN.exec(note)

    if (!match) {
        return null
    }

    const [, noteName, octaveRaw] = match
    const octave = Number(octaveRaw)
    const semitone = NOTE_OFFSETS[noteName]

    if (semitone === undefined) {
        return null
    }

    const midi = (octave + 1) * 12 + semitone
    const distanceFromA4 = midi - 69
    return 440 * 2 ** (distanceFromA4 / 12)
}

export function centsOff(currentHz, targetHz) {
    if (!currentHz || !targetHz) {
        return null
    }

    return 1200 * Math.log2(currentHz / targetHz)
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}
