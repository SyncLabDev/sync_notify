-- This event is intentionally ACE-gated. Server resources should prefer the export.
RegisterNetEvent('sync_notify:server:notifySelf', function(options)
    local playerId = source
    if not IsPlayerAceAllowed(playerId, 'sync_notify.self') then return end
    if not SyncNotify.ServerAllowed(playerId) then return end
    SyncNotify.NotifyPlayer(playerId, options)
end)

