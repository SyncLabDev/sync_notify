if SyncNotifyBridge.name == 'esx' then
    local ESX = exports['es_extended']:getSharedObject()
    SyncNotifyBridge.playerLoaded = function() return ESX.IsPlayerLoaded() end
end

