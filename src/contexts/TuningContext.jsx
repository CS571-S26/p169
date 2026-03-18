/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const TuningContext = createContext(null)

const DEFAULT_TUNINGS = [
    {
        id: 'standard',
        name: 'Standard (E)',
        notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        builtin: true,
    },
    {
        id: 'drop-d',
        name: 'Drop D',
        notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        builtin: true,
    },
]

const DEFAULT_ACTIVE = 'standard'

function getStorageKey(userId) {
    return `stringpilot-tunings-${userId || 'guest'}`
}

function readStoredTunings(userId) {
    try {
        const raw = localStorage.getItem(getStorageKey(userId))
        if (!raw) {
            return {
                tunings: DEFAULT_TUNINGS,
                activeTuningId: DEFAULT_ACTIVE,
            }
        }

        const parsed = JSON.parse(raw)
        const tunings = Array.isArray(parsed.tunings) && parsed.tunings.length > 0
            ? parsed.tunings
            : DEFAULT_TUNINGS
        const activeTuningId = parsed.activeTuningId || tunings[0].id

        return {
            tunings,
            activeTuningId,
        }
    } catch {
        return {
            tunings: DEFAULT_TUNINGS,
            activeTuningId: DEFAULT_ACTIVE,
        }
    }
}

export function TuningProvider({ children, storageUserId = 'guest' }) {
    const [state, setState] = useState(() => readStoredTunings(storageUserId))
    const { tunings, activeTuningId } = state

    useEffect(() => {
        const payload = { tunings, activeTuningId }
        localStorage.setItem(getStorageKey(storageUserId), JSON.stringify(payload))
    }, [activeTuningId, storageUserId, tunings])

    const activeTuning = useMemo(
        () => tunings.find((tuning) => tuning.id === activeTuningId) ?? tunings[0] ?? null,
        [activeTuningId, tunings],
    )

    const createTuning = useCallback((name, notes) => {
        const next = {
            id: `custom-${Date.now()}`,
            name,
            notes,
            builtin: false,
        }

        setState((current) => ({
            tunings: [...current.tunings, next],
            activeTuningId: next.id,
        }))
        return next
    }, [])

    const removeTuning = useCallback((tuningId) => {
        setState((current) => {
            const target = current.tunings.find((t) => t.id === tuningId)
            if (!target || target.builtin) {
                return current
            }

            const nextTunings = current.tunings.filter((t) => t.id !== tuningId)
            return {
                tunings: nextTunings.length > 0 ? nextTunings : DEFAULT_TUNINGS,
                activeTuningId:
                    current.activeTuningId === tuningId ? DEFAULT_ACTIVE : current.activeTuningId,
            }
        })
    }, [])

    const selectTuning = useCallback((tuningId) => {
        setState((current) => ({
            ...current,
            activeTuningId: tuningId,
        }))
    }, [])

    const value = useMemo(
        () => ({
            tunings,
            activeTuning,
            activeTuningId,
            setActiveTuningId: selectTuning,
            createTuning,
            removeTuning,
        }),
        [activeTuning, activeTuningId, createTuning, removeTuning, selectTuning, tunings],
    )

    return <TuningContext.Provider value={value}>{children}</TuningContext.Provider>
}

export function useTunings() {
    const context = useContext(TuningContext)

    if (!context) {
        throw new Error('useTunings must be used inside TuningProvider')
    }

    return context
}
