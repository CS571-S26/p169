import { supabase } from './supabaseClient.js'

const PRESET_TABLE = 'user_presets'

export const BUILTIN_PRESETS = [
    {
        id: 'builtin-standard',
        name: 'Standard',
        selectedNotes: { E2: 'E2', A2: 'A2', D3: 'D3', G3: 'G3', B3: 'B3', E4: 'E4' },
    },
    {
        id: 'builtin-drop-d',
        name: 'Drop D',
        selectedNotes: { E2: 'D2', A2: 'A2', D3: 'D3', G3: 'G3', B3: 'B3', E4: 'E4' },
    },
    {
        id: 'builtin-open-g',
        name: 'Open G',
        selectedNotes: { E2: 'D2', A2: 'G2', D3: 'D3', G3: 'G3', B3: 'B3', E4: 'D4' },
    },
    {
        id: 'builtin-open-d',
        name: 'Open D',
        selectedNotes: { E2: 'D2', A2: 'A2', D3: 'D3', G3: 'F#3', B3: 'A3', E4: 'D4' },
    },
    {
        id: 'builtin-dadgad',
        name: 'DADGAD',
        selectedNotes: { E2: 'D2', A2: 'A2', D3: 'D3', G3: 'G3', B3: 'A3', E4: 'D4' },
    },
]

export function getBuiltinPresets() {
    return BUILTIN_PRESETS.map((preset) => ({
        ...preset,
        selectedNotes: { ...preset.selectedNotes },
    }))
}

function normalizePresetRow(row) {
    return {
        id: row.id,
        name: row.name,
        selectedNotes: row.selected_notes || {},
        updatedAt: row.updated_at,
    }
}

export async function fetchUserPresets(userId) {
    const { data, error } = await supabase
        .from(PRESET_TABLE)
        .select('id, name, selected_notes, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        return { presets: [], error }
    }

    return {
        presets: (data || []).map(normalizePresetRow),
        error: null,
    }
}

export async function createUserPreset(userId, name, selectedNotes) {
    const { data, error } = await supabase
        .from(PRESET_TABLE)
        .insert({
            user_id: userId,
            name,
            selected_notes: selectedNotes,
        })
        .select('id, name, selected_notes, updated_at')
        .single()

    return {
        preset: data ? normalizePresetRow(data) : null,
        error,
    }
}

export async function updateUserPreset(presetId, selectedNotes) {
    const { data, error } = await supabase
        .from(PRESET_TABLE)
        .update({
            selected_notes: selectedNotes,
        })
        .eq('id', presetId)
        .select('id, name, selected_notes, updated_at')
        .single()

    return {
        preset: data ? normalizePresetRow(data) : null,
        error,
    }
}

export async function deleteUserPreset(presetId) {
    const { error } = await supabase
        .from(PRESET_TABLE)
        .delete()
        .eq('id', presetId)

    return { error }
}

export async function createDefaultPresets(userId) {
    const createdPresets = []

    for (const preset of BUILTIN_PRESETS) {
        const { preset: created, error } = await createUserPreset(userId, preset.name, preset.selectedNotes)
        if (!error && created) {
            createdPresets.push(created)
        }
    }

    return createdPresets
}