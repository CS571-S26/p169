# TunedUp

WIP guitar tuner that uses web audio api and accounts for saved tunings.

Majority AI at the moment, meant for visual direction and scaffolding.

## NEED TO DO

Fix sensitivity with mic input -> doesn't hold a note so can't really tune anything.
Does detect for a split second somewhat accurately.

- UI needs work.
    - String selection for tuning should be radio buttons or scroll with list, maybe play audio of string?
    - Start listening should swap to stop instead of 2 separate buttons.
    - Login page too wide, should be top right dropdown or popup. Only account page for settings.

Swap to supabase auth.

Switch to next.js + tailwind

Test on mobile.

## Current Structure

- src/contexts/AuthContext.jsx
	- Local auth state and session persistence
- src/contexts/TuningContext.jsx
	- Built-in tunings + custom tuning storage per user
- src/hooks/useTunerEngine.js
	- Web Audio microphone capture and pitch detection
- src/components/TunerPanel.jsx
	- Live tuner UI
- src/components/TuningLibraryPanel.jsx
	- Manage tuning presets
- src/components/AccountPanel.jsx
	- Login/register/logout shell
