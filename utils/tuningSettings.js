export const STRING_ORDER = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function midiToNote(midi) {
    const noteName = CHROMATIC_NOTES[midi % 12]
    const octave = Math.floor(midi / 12) - 1
    return `${noteName}${octave}`
}

const STRING_NOTE_RANGES = {
    E2: [38, 43],
    A2: [43, 48],
    D3: [48, 53],
    G3: [53, 57],
    B3: [57, 62],
    E4: [62, 67],
}

export const STRING_OPTIONS = Object.fromEntries(
    STRING_ORDER.map((stringName) => [
        stringName,
        Array.from({ length: STRING_NOTE_RANGES[stringName][1] - STRING_NOTE_RANGES[stringName][0] + 1 }, (_, index) =>
            midiToNote(STRING_NOTE_RANGES[stringName][0] + index)
        ),
    ])
)

export const DEFAULT_SELECTED_NOTES = {
    E2: 'E2',
    A2: 'A2',
    D3: 'D3',
    G3: 'G3',
    B3: 'B3',
    E4: 'E4',
}

const STORAGE_KEY = 'tunedup-selected-notes'

export function noteToFrequency(note) {
    const match = /^([A-G](?:#|b)?)(-?\d)$/.exec(note)
    if (!match) {
        return null
    }

    const noteOffsets = {
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

    const [, noteName, octaveRaw] = match
    const semitone = noteOffsets[noteName]
    if (semitone === undefined) {
        return null
    }

    const octave = Number(octaveRaw)
    const midi = (octave + 1) * 12 + semitone
    const distanceFromA4 = midi - 69
    return 440 * 2 ** (distanceFromA4 / 12)
}

export function loadSelectedNotes() {
    if (typeof window === 'undefined') {
        return DEFAULT_SELECTED_NOTES
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return DEFAULT_SELECTED_NOTES
        }

        const parsed = JSON.parse(raw)
        return {
            ...DEFAULT_SELECTED_NOTES,
            ...parsed,
        }
    } catch {
        return DEFAULT_SELECTED_NOTES
    }
}

export function saveSelectedNotes(selectedNotes) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedNotes))
    window.dispatchEvent(new Event('tuning-settings-updated'))
}

export function getTuningStrings(selectedNotes) {
    return STRING_ORDER.map((stringName) => ({
        stringName,
        note: selectedNotes[stringName] || DEFAULT_SELECTED_NOTES[stringName],
        hz: noteToFrequency(selectedNotes[stringName] || DEFAULT_SELECTED_NOTES[stringName]),
    }))
}
