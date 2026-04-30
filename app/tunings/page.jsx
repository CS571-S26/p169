'use client'

import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useAuthState } from '../../components/AuthStateContext.jsx'
import { DEFAULT_SELECTED_NOTES, STRING_ORDER, STRING_OPTIONS, loadSelectedNotes, saveSelectedNotes } from '../../utils/tuningSettings.js'
import {
    BUILTIN_PRESETS,
    createUserPreset,
    createDefaultPresets,
    deleteUserPreset,
    fetchUserPresets,
    getBuiltinPresets,
    updateUserPreset,
} from '../../utils/presetStore.js'

const DEFAULT_PRESET_NAMES = new Set(BUILTIN_PRESETS.map((preset) => preset.name))

export default function TuningsPage() {
    const { authUser, isSignedIn, isLoading } = useAuthState()
    const [selectedNotes, setSelectedNotes] = useState(() => loadSelectedNotes())
    const [presets, setPresets] = useState([])
    const [presetName, setPresetName] = useState('')
    const [selectedPresetId, setSelectedPresetId] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncFeedback, setSyncFeedback] = useState('')
    const [syncError, setSyncError] = useState('')

    useEffect(() => {
        saveSelectedNotes(selectedNotes)
    }, [selectedNotes])

    useEffect(() => {
        const loadPresets = async () => {
            if (!isSignedIn || !authUser?.id) {
                const builtInPresets = getBuiltinPresets()
                setPresets(builtInPresets)
                setSelectedPresetId((current) => {
                    if (current && builtInPresets.some((preset) => preset.id === current)) {
                        return current
                    }

                    return builtInPresets[0]?.id || ''
                })
                return
            }

            setIsSyncing(true)
            setSyncError('')
            const { presets: loadedPresets, error } = await fetchUserPresets(authUser.id)
            if (error) {
                setSyncError(error.message)
                setIsSyncing(false)
                return
            }

            let presetsToUse = loadedPresets
            if (presetsToUse.length === 0) {
                const defaultPresets = await createDefaultPresets(authUser.id)
                presetsToUse = defaultPresets
            }

            setPresets(presetsToUse)
            setSelectedPresetId((current) => {
                if (current && presetsToUse.some((preset) => preset.id === current)) {
                    return current
                }

                return presetsToUse[0]?.id || ''
            })
            setIsSyncing(false)
        }

        loadPresets()
    }, [authUser?.id, isSignedIn])

    const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) || null

    const handleApplyPreset = () => {
        if (!selectedPreset) {
            return
        }

        setSelectedNotes({
            ...DEFAULT_SELECTED_NOTES,
            ...selectedPreset.selectedNotes,
        })
        setSyncFeedback(`Applied preset "${selectedPreset.name}".`)
        setSyncError('')
    }

    const handleSavePreset = async () => {
        if (!isSignedIn || !authUser?.id) {
            setSyncError('Sign in to save cloud presets.')
            return
        }

        const trimmedName = presetName.trim()
        if (!trimmedName) {
            setSyncError('Enter a preset name before saving.')
            return
        }

        setIsSyncing(true)
        setSyncFeedback('')
        setSyncError('')

        const { preset, error } = await createUserPreset(authUser.id, trimmedName, selectedNotes)
        if (error) {
            setSyncError(error.message)
            setIsSyncing(false)
            return
        }

        setPresets((current) => [preset, ...current])
        setSelectedPresetId(preset.id)
        setSyncFeedback(`Saved preset "${preset.name}".`)
        setPresetName('')
        setIsSyncing(false)
    }

    const handleUpdatePreset = async () => {
        if (!selectedPreset) {
            setSyncError('Select a preset to update.')
            return
        }

        setIsSyncing(true)
        setSyncFeedback('')
        setSyncError('')

        const { preset, error } = await updateUserPreset(selectedPreset.id, selectedNotes)
        if (error) {
            setSyncError(error.message)
            setIsSyncing(false)
            return
        }

        setPresets((current) => current.map((entry) => (entry.id === preset.id ? preset : entry)))
        setSyncFeedback(`Updated preset "${preset.name}".`)
        setIsSyncing(false)
    }

    const handleDeletePreset = async () => {
        if (!selectedPreset) {
            setSyncError('Select a preset to delete.')
            return
        }

        if (DEFAULT_PRESET_NAMES.has(selectedPreset.name)) {
            setSyncError('Built-in presets cannot be deleted.')
            return
        }

        setIsSyncing(true)
        setSyncFeedback('')
        setSyncError('')

        const presetId = selectedPreset.id
        const presetLabel = selectedPreset.name
        const { error } = await deleteUserPreset(presetId)
        if (error) {
            setSyncError(error.message)
            setIsSyncing(false)
            return
        }

        setPresets((current) => current.filter((entry) => entry.id !== presetId))
        setSelectedPresetId('')
        setSyncFeedback(`Deleted preset "${presetLabel}".`)
        setIsSyncing(false)
    }

    return (
        <section className="main-panel rounded-4 border border-stone-300 p-4 shadow-sm grid gap-3">
            <h1 className="text-2xl font-semibold">Tunings</h1>

            {/* Presets Section - Top */}
            <div className="inner-panel grid gap-3 rounded-4 border border-stone-200 bg-stone-50 p-3">
                <div className="fw-semibold">Presets</div>
                <p className="text-stone-600 mb-0">
                    {isSignedIn
                        ? 'Save this setup to your account, then load it from any device.'
                        : 'Sign in to create presets that sync across devices.'}
                </p>

                {syncError ? <Alert variant="danger" className="mb-0">{syncError}</Alert> : null}
                {syncFeedback ? <Alert variant="success" className="mb-0">{syncFeedback}</Alert> : null}

                <Form.Group controlId="presetName">
                    <Form.Label>New preset name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ex: Drop D Rhythm"
                        value={presetName}
                        onChange={(event) => setPresetName(event.target.value)}
                        disabled={!isSignedIn || isLoading || isSyncing}
                    />
                </Form.Group>

                <Button variant="dark" onClick={handleSavePreset} disabled={!isSignedIn || isLoading || isSyncing}>
                    Save as New Preset
                </Button>

                <Form.Group controlId="presetSelect">
                    <Form.Label>Saved presets</Form.Label>
                    <Form.Select
                        value={selectedPresetId}
                        onChange={(event) => setSelectedPresetId(event.target.value)}
                        disabled={isLoading || isSyncing || presets.length === 0}
                    >
                        <option value="">{presets.length === 0 ? 'No presets yet' : 'Select a preset'}</option>
                        {presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <div className="d-flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={handleApplyPreset} disabled={!selectedPreset || isSyncing}>
                        Apply Selected Preset
                    </Button>
                    <Button variant="outline-dark" onClick={handleUpdatePreset} disabled={!isSignedIn || isLoading || isSyncing || !selectedPreset}>
                        Update Selected Preset
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={handleDeletePreset}
                        disabled={!isSignedIn || isLoading || isSyncing || !selectedPreset || DEFAULT_PRESET_NAMES.has(selectedPreset?.name)}
                    >
                        Delete Selected Preset
                    </Button>
                </div>
            </div>

            {/* String Tuning Section */}
            <div className="inner-panel rounded-4 border border-stone-200 bg-stone-50 p-3">
                <div className="fw-semibold mb-3">Choose the note for each string</div>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {STRING_ORDER.map((stringName) => (
                        <Form.Group key={stringName} controlId={`string-${stringName}`}>
                            <Form.Label className="text-sm mb-1">String {stringName}</Form.Label>
                            <Form.Select
                                size="sm"
                                value={selectedNotes[stringName]}
                                onChange={(event) =>
                                    setSelectedNotes((current) => ({
                                        ...current,
                                        [stringName]: event.target.value,
                                    }))
                                }
                            >
                                {STRING_OPTIONS[stringName].map((note) => (
                                    <option key={note} value={note}>
                                        {note}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    ))}
                </div>
            </div>

            {/* Current Setup Summary */}
            <div className="inner-panel rounded-4 border border-stone-200 bg-stone-50 p-3">
                <div className="fw-semibold mb-2">Current setup</div>
                <div className="d-flex flex-wrap gap-3">
                    {STRING_ORDER.map((stringName) => (
                        <div key={stringName} className="text-sm">
                            <span className="fw-semibold">{stringName}:</span> {selectedNotes[stringName]}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
