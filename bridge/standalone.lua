SyncNotifyBridge = SyncNotifyBridge or { name = 'standalone' }

local function chooseFramework()
    if Config.Framework ~= 'auto' then return Config.Framework end
    if GetResourceState('qbx_core') == 'started' then return 'qbox' end
    if GetResourceState('qb-core') == 'started' then return 'qbcore' end
    if GetResourceState('es_extended') == 'started' then return 'esx' end
    return 'standalone'
end

SyncNotifyBridge.name = chooseFramework()

