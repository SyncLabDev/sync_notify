fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'sync_notify'
author 'SYNC Lab'
description 'Compact, production-ready notification framework for FiveM'
version '1.1.0'
license 'SYNC Lab Community Source License'

ui_page 'web/dist/index.html'

shared_scripts {
    'config.lua',
    'shared/constants.lua',
    'shared/utils.lua'
}

client_scripts {
    'client/validation.lua',
    'bridge/standalone.lua',
    'bridge/qbox.lua',
    'bridge/qbcore.lua',
    'bridge/esx.lua',
    'bridge/oxlib.lua',
    'client/main.lua',
    'client/events.lua',
    'client/exports.lua'
}

server_scripts {
    'server/main.lua',
    'server/events.lua'
}

files {
    'web/dist/index.html',
    'web/dist/**/*',
    'sounds/*'
}

provide 'sync_notify'

