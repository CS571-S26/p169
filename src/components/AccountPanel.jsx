import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export function AccountPanel() {
    const { user, login, register, logout } = useAuth()
    const [loginEmail, setLoginEmail] = useState('')
    const [registerName, setRegisterName] = useState('')
    const [registerEmail, setRegisterEmail] = useState('')

    const submitLogin = (event) => {
        event.preventDefault()
        login(loginEmail)
        setLoginEmail('')
    }

    const submitRegister = (event) => {
        event.preventDefault()
        register(registerName, registerEmail)
        setRegisterName('')
        setRegisterEmail('')
    }

    return (
        <section className="panel">
            <h2>Account</h2>
            {user ? (
                <div className="account-card">
                    <p>
                        Signed in as <strong>{user.displayName}</strong> ({user.email})
                    </p>
                    <button type="button" className="secondary-btn" onClick={logout}>
                        Log Out
                    </button>
                </div>
            ) : (
                <div className="account-card">
                    <form className="form-card grid" onSubmit={submitLogin}>
                        <h3>Login</h3>
                        <label className="grid">
                            Email
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(event) => setLoginEmail(event.target.value)}
                                placeholder="badger@wisc.edu"
                                required
                            />
                        </label>
                        <button type="submit" className="primary-btn">
                            Login
                        </button>
                    </form>

                    <form className="form-card grid" onSubmit={submitRegister}>
                        <h3>Create Account</h3>
                        <label className="grid">
                            Display Name
                            <input
                                value={registerName}
                                onChange={(event) => setRegisterName(event.target.value)}
                                placeholder="Bucky Badger"
                                required
                            />
                        </label>
                        <label className="grid">
                            Email
                            <input
                                type="email"
                                value={registerEmail}
                                onChange={(event) => setRegisterEmail(event.target.value)}
                                placeholder="badger@wisc.edu"
                                required
                            />
                        </label>
                        <button type="submit" className="primary-btn">
                            Register
                        </button>
                    </form>
                </div>
            )}
        </section>
    )
}
