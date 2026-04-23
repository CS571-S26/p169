const AUTH_STORAGE_KEY = 'tunedup-auth-user'

export function loadAuthUser() {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function saveAuthUser(user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('auth-state-updated'))
}

export function clearAuthUser() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.dispatchEvent(new Event('auth-state-updated'))
}
