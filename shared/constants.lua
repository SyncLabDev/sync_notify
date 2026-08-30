SyncNotify = SyncNotify or {}

SyncNotify.Types = {
    success = true, error = true, warning = true,
    info = true, dispatch = true, custom = true
}

SyncNotify.Positions = {
    ['top-left'] = true, ['top-center'] = true, ['top-right'] = true,
    ['middle-left'] = true, ['middle-right'] = true,
    ['bottom-left'] = true, ['bottom-center'] = true, ['bottom-right'] = true
}

SyncNotify.DuplicateModes = { allow = true, replace = true, increment = true, refresh = true }
SyncNotify.ProgressStyles = { rail = true, minimal = true, none = true }
SyncNotify.Modes = { auto = true, micro = true, full = true }
SyncNotify.Designs = { split = true, floating = true }
SyncNotify.BuiltinIcons = {
    check = true, car = true, shield = true, wallet = true,
    ['triangle-alert'] = true, info = true, radio = true,
    ['heart-pulse'] = true, x = true, bell = true, loader = true
}
