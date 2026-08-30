# Optional sounds

Place licensed `.ogg` notification sounds here and reference their logical names from themes or notifications (`sound = 'myalert'` resolves `sounds/myalert.ogg` at runtime). The resource ships without audio files: the default implementation plays a lightweight synthesized chime, and any missing or unsupported file falls back to it automatically. Built-in variant names (`success`, `error`, `warning`, `info`, `dispatch`, `custom`) always select the synthesized melody instead of a file lookup.
