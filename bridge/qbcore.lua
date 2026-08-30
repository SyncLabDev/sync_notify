if SyncNotifyBridge.name == 'qbcore' then
    local QBCore = exports['qb-core']:GetCoreObject({ 'Functions' })
    SyncNotifyBridge.playerLoaded = function() return QBCore.Functions.GetPlayerData().citizenid ~= nil end
end

