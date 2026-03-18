import { useState } from 'react'
import { useTunings } from '../contexts/TuningContext.jsx'

const EMPTY_NOTES = ['', '', '', '', '', '']

function normalizeNotes(notes) {
    return notes.map((note) => note.trim().toUpperCase())
}

export function TuningLibraryPanel() {
    const { tunings, activeTuningId, setActiveTuningId, createTuning, removeTuning } = useTunings()
    const [name, setName] = useState('')
    const [notes, setNotes] = useState(EMPTY_NOTES)

    const setNoteAt = (index, value) => {
        setNotes((current) => current.map((item, i) => (i === index ? value : item)))
    }

    const submit = (event) => {
        event.preventDefault()

        const normalized = normalizeNotes(notes)
        if (!name.trim()) {
            return
        }

        const hasAllNotes = normalized.every((note) => note.length > 1)
        if (!hasAllNotes) {
            return
        }

        createTuning(name.trim(), normalized)
        setName('')
        setNotes(EMPTY_NOTES)
    }

    return (
        <section className="panel">
            <h2>Tuning Library</h2>
            <p className="panel-intro">Create and switch between saved six-string guitar tunings.</p>

            <form onSubmit={submit} className="grid">
                <label className="grid">
                    Name
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Open C, DADGAD, etc."
                        required
                    />
                </label>

                <div className="grid two">
                    {notes.map((note, index) => (
                        <label key={index} className="grid">
                            String {index + 1}
                            <input
                                value={note}
                                onChange={(event) => setNoteAt(index, event.target.value)}
                                placeholder="E2"
                                required
                            />
                        </label>
                    ))}
                </div>

                <button type="submit" className="primary-btn">
                    Save Custom Tuning
                </button>
            </form>

            <ul className="tuning-list">
                {tunings.map((tuning) => (
                    <li key={tuning.id} className="tuning-item">
                        <div>
                            <p className="tuning-name">{tuning.name}</p>
                            <p className="notes">{tuning.notes.join(' - ')}</p>
                        </div>
                        <div className="actions-row">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setActiveTuningId(tuning.id)}
                                disabled={activeTuningId === tuning.id}
                            >
                                {activeTuningId === tuning.id ? 'Active' : 'Use'}
                            </button>
                            {!tuning.builtin && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => removeTuning(tuning.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
