RegisterNetEvent('sync_notify:client:notify', function(options)
    SyncNotify.Notify(options)
end)

RegisterNetEvent('sync_notify:client:update', function(handle, patch)
    SyncNotify.Update(handle, patch)
end)

RegisterNetEvent('sync_notify:client:remove', function(handle)
    SyncNotify.Remove(handle)
end)

RegisterNetEvent('sync_notify:client:clear', function(position)
    SyncNotify.Clear(position)
end)

RegisterCommand('syncnotify_test', function()
    if not Config.Debug then return end
    SyncNotify.Notify({ type = 'success', title = 'SYNC Notify', message = 'Runtime test passed.', icon = 'check' })
end, false)

