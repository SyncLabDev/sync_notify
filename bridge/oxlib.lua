-- Optional ox_lib compatibility bridge.
-- Lets ox-shaped payloads (lib.notify tables) render through SYNC Notify without
-- rewriting call sites field by field.

local typeMap = {
    informative = 'info', success = 'success', error = 'error',
    warn = 'warning', warning = 'warning'
}

local positionMap = {
    top = 'top-center', bottom = 'bottom-center',
    ['top-left'] = 'top-left', ['top-right'] = 'top-right',
    ['bottom-left'] = 'bottom-left', ['bottom-right'] = 'bottom-right',
    ['middle-left'] = 'middle-left', ['middle-right'] = 'middle-right'
}

-- ox_lib ships every Lucide icon; SYNC renders its built-in set. Known equivalents are
-- translated, anything else degrades to the bell instead of failing validation.
local iconMap = {
    ['circle-check'] = 'check', ['circle-check-big'] = 'check', ['check'] = 'check',
    ['circle-x'] = 'x', ['x'] = 'x',
    ['circle-alert'] = 'triangle-alert', ['triangle-alert'] = 'triangle-alert', ['alert-triangle'] = 'triangle-alert',
    ['info'] = 'info', ['radio'] = 'radio', ['shield'] = 'shield', ['shield-check'] = 'shield',
    ['wallet'] = 'wallet', ['car'] = 'car', ['heart-pulse'] = 'heart-pulse', ['bell'] = 'bell',
    ['loader-circle'] = 'loader', ['loader'] = 'loader', ['briefcase'] = 'wallet', ['money'] = 'wallet'
}

function SyncNotify.OxNotify(data)
    if type(data) ~= 'table' then return nil end
    local message = data.description or data.title
    if type(message) ~= 'string' then return nil end
    local options = {
        id = data.id,
        title = data.description and data.title or nil,
        message = message,
        type = typeMap[data.type] or 'info',
        duration = type(data.duration) == 'number' and math.floor(data.duration * 1000) or nil,
        icon = data.icon and (iconMap[data.icon] or 'bell') or nil,
        -- ox replaces notifications with the same id by default.
        duplicateMode = data.id and 'replace' or nil
    }
    if data.position then
        local mapped = positionMap[data.position]
        options.position = mapped and mapped or (SyncNotify.Positions[data.position] and data.position or nil)
    end
    return SyncNotify.Notify(options)
end

function SyncNotify.OxHide(id)
    if type(id) ~= 'string' then return false end
    for handle, notification in pairs(SyncNotify.Internal.active) do
        if notification.id == id then return SyncNotify.Remove(handle) end
    end
    return false
end

-- Transparent takeover for servers that run without ox_lib: existing
-- `TriggerClientEvent('ox_lib:notify', src, data)` producers keep working unchanged.
-- Checked per event so resource start order in server.cfg does not matter.
AddEventHandler('ox_lib:notify', function(data)
    if GetResourceState('ox_lib') == 'started' then return end
    SyncNotify.OxNotify(data)
end)

exports('OxNotify', function(data) return SyncNotify.OxNotify(data) end)
exports('OxHide', function(id) return SyncNotify.OxHide(id) end)

-- Admins routinely ask why ox_lib keeps showing its own UI while the bridge is
-- installed; surface the answer once at startup when debugging is enabled.
CreateThread(function()
    if not Config.Debug then return end
    for _ = 1, 30 do
        local state = GetResourceState('ox_lib')
        if state == 'missing' then return end
        if state == 'started' then
            print(('[sync_notify] ox_lib detected — the ox_lib:notify takeover stays idle to avoid duplicate notifications. Route payloads with exports["%s"]:OxNotify(data) (see README "ox_lib compatibility").'):format(GetCurrentResourceName()))
            return
        end
        Wait(1000)
    end
end)
