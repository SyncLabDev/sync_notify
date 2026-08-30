local buckets = {}

local function allowed(source)
    local now = os.time() * 1000
    local bucket = buckets[source]
    if not bucket or now - bucket.started >= Config.Limits.serverWindow then
        buckets[source] = { started = now, count = 1 }
        return true
    end
    if bucket.count >= Config.Limits.serverBurst then return false end
    bucket.count = bucket.count + 1
    return true
end

function SyncNotify.NotifyPlayer(playerId, options)
    playerId = tonumber(playerId)
    if not playerId or playerId <= 0 or GetPlayerPing(playerId) <= 0 then return false end
    if type(options) ~= 'table' then return false end
    TriggerClientEvent('sync_notify:client:notify', playerId, SyncNotify.SafeCopy(options, Config.Limits.metadataDepth + 2))
    return true
end

exports('NotifyPlayer', SyncNotify.NotifyPlayer)

AddEventHandler('playerDropped', function() buckets[source] = nil end)
SyncNotify.ServerAllowed = allowed

