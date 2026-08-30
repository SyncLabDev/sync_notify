local sequence = 0
local active = {}
local themes = {}
local states = {}

local function nextHandle()
    sequence = sequence + 1
    return ('sync:%s:%s'):format(GetGameTimer(), sequence)
end

local function send(action, data)
    SendNUIMessage({ scope = 'sync_notify', action = action, data = data })
end

function SyncNotify.Notify(options)
    local normalized, err = SyncNotify.Normalize(options, false)
    if not normalized then
        if Config.Debug then print(('[sync_notify] rejected notification: %s'):format(err)) end
        return nil
    end
    local handle = nextHandle()
    normalized.handle = handle
    active[handle] = normalized
    send('notify', normalized)
    return handle
end

function SyncNotify.Action(options)
    if type(options) ~= 'table' then return nil end
    options.actions = options.actions or {}
    return SyncNotify.Notify(options)
end

function SyncNotify.Update(handle, patch)
    if type(handle) ~= 'string' or not active[handle] then return false end
    local normalized = SyncNotify.Normalize(patch, true)
    if not normalized then return false end
    for key, value in pairs(normalized) do active[handle][key] = value end
    send('update', { handle = handle, patch = normalized })
    return true
end

function SyncNotify.Remove(handle)
    if type(handle) ~= 'string' or not active[handle] then return false end
    local wasAction = active[handle].actions ~= nil
    active[handle] = nil
    send('remove', { handle = handle })
    if wasAction then SetNuiFocus(false, false) end
    return true
end

function SyncNotify.Clear(position)
    if position ~= nil and not SyncNotify.Positions[position] then return false end
    for handle, notification in pairs(active) do
        if not position or notification.position == position then active[handle] = nil end
    end
    send('clear', { position = position })
    SetNuiFocus(false, false)
    return true
end

function SyncNotify.RegisterTheme(name, definition)
    name = SyncNotify.Text(name, 32)
    local theme = SyncNotify.NormalizeTheme(definition)
    if not name or name == '' or not theme then return false end
    themes[name] = theme
    send('registerTheme', { name = name, definition = theme })
    return true
end

function SyncNotify.RegisterState(name, definition)
    name = SyncNotify.Text(name, 32)
    local state = SyncNotify.NormalizeTheme(definition)
    if not name or name == '' or not state then return false end
    states[name] = state
    send('registerState', { name = name, definition = state })
    return true
end

RegisterNUICallback('ready', function(_, cb)
    cb({ ok = true, config = Config, themes = themes, states = states })
end)

RegisterNUICallback('expired', function(data, cb)
    local expiredAction = type(data) == 'table' and type(data.handle) == 'string' and active[data.handle] and active[data.handle].actions ~= nil
    if type(data) == 'table' and type(data.handle) == 'string' then active[data.handle] = nil end
    if expiredAction then SetNuiFocus(false, false) end
    cb({ ok = true })
end)

RegisterNUICallback('focus', function(data, cb)
    local enabled = type(data) == 'table' and data.enabled == true
    SetNuiFocus(enabled, enabled)
    cb({ ok = true })
end)

RegisterNUICallback('action', function(data, cb)
    local notification = type(data) == 'table' and active[data.handle]
    if not notification or type(data.actionId) ~= 'string' then return cb({ ok = false }) end
    local valid = false
    for _, action in ipairs(notification.actions or {}) do
        if action.id == data.actionId then valid = true break end
    end
    if not valid then return cb({ ok = false }) end
    active[data.handle] = nil
    SetNuiFocus(false, false)
    TriggerEvent('sync_notify:action', data.handle, data.actionId)
    cb({ ok = true })
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    SetNuiFocus(false, false)
    active = {}
end)

SyncNotify.Internal = { send = send, active = active }

