exports('Notify', function(options, message)
    if type(options) == 'string' and message ~= nil then options = { type = options, message = message } end
    return SyncNotify.Notify(options)
end)
exports('Action', SyncNotify.Action)
exports('Update', SyncNotify.Update)
exports('Remove', SyncNotify.Remove)
exports('Clear', SyncNotify.Clear)
exports('RegisterTheme', SyncNotify.RegisterTheme)
exports('RegisterState', SyncNotify.RegisterState)

