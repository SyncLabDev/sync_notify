if SyncNotifyBridge.name == 'qbox' then
    SyncNotifyBridge.playerLoaded = function() return LocalPlayer.state.isLoggedIn == true end
end

