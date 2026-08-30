local function normalizeActions(actions)
    if type(actions) ~= 'table' then return nil end
    local normalized, seen = {}, {}
    for _, action in ipairs(actions) do
        if #normalized >= Config.Limits.actions then break end
        if type(action) == 'table' then
            local id = SyncNotify.Text(action.id, 32)
            local label = SyncNotify.Text(action.label, Config.Limits.actionLabel)
            if id and id ~= '' and label and label ~= '' and not seen[id] then
                seen[id] = true
                normalized[#normalized + 1] = { id = id, label = label }
            end
        end
    end
    return #normalized > 0 and normalized or nil
end

function SyncNotify.Normalize(input, patch)
    if type(input) == 'string' then input = { message = input } end
    if type(input) ~= 'table' then return nil, 'options must be a table' end

    local result = {}
    local kind = SyncNotify.Types[input.type] and input.type or (patch and input.type or 'info')
    if kind then result.type = kind end
    if input.id ~= nil then result.id = SyncNotify.Text(input.id, 64) end
    if input.title ~= nil then result.title = SyncNotify.Text(input.title, Config.Limits.title, '') end
    if input.message ~= nil then result.message = SyncNotify.Text(input.message, Config.Limits.message, '') end
    if not patch and (not result.message or result.message == '') then return nil, 'message is required' end

    if input.icon ~= nil then
        local icon = SyncNotify.Text(input.icon, 48)
        result.icon = SyncNotify.BuiltinIcons[icon] and icon or 'bell'
    end
    if input.duration ~= nil then result.duration = SyncNotify.Clamp(input.duration, Config.Limits.minDuration, Config.Limits.maxDuration) end
    if not patch and result.duration == nil then result.duration = Config.Duration end
    if input.persistent ~= nil then result.persistent = input.persistent == true end
    if input.priority ~= nil then result.priority = math.floor(SyncNotify.Clamp(input.priority, 0, 3) or 0) end
    if not patch and result.priority == nil then result.priority = 0 end
    if input.position ~= nil then result.position = SyncNotify.Positions[input.position] and input.position or Config.Position end
    if not patch and result.position == nil then result.position = Config.Position end
    if input.sound ~= nil then result.sound = type(input.sound) == 'string' and SyncNotify.Text(input.sound, 32) or input.sound == true end
    if input.progress ~= nil then
        result.progress = type(input.progress) == 'number' and SyncNotify.Clamp(input.progress, 0, 100) or input.progress == true
    end
    if input.progressStyle ~= nil then result.progressStyle = SyncNotify.ProgressStyles[input.progressStyle] and input.progressStyle or 'rail' end
    if input.mode ~= nil then result.mode = SyncNotify.Modes[input.mode] and input.mode or Config.Mode end
    if not patch and result.mode == nil then result.mode = SyncNotify.Modes[Config.Mode] and Config.Mode or 'auto' end
    local defaultDesign = SyncNotify.Designs[Config.Design] and Config.Design or 'floating'
    if input.design ~= nil then result.design = SyncNotify.Designs[input.design] and input.design or defaultDesign end
    if not patch and result.design == nil then result.design = defaultDesign end
    if input.duplicateMode ~= nil then result.duplicateMode = SyncNotify.DuplicateModes[input.duplicateMode] and input.duplicateMode or 'allow' end
    if input.theme ~= nil then result.theme = SyncNotify.Text(input.theme, 32) end
    if input.actions ~= nil then result.actions = normalizeActions(input.actions) end
    if input.metadata ~= nil then result.metadata = SyncNotify.SafeCopy(input.metadata, Config.Limits.metadataDepth) end
    return result
end

function SyncNotify.NormalizeTheme(definition)
    if type(definition) ~= 'table' then return nil end
    local theme = {
        accent = SyncNotify.SafeColor(definition.accent),
        icon = SyncNotify.BuiltinIcons[definition.icon] and definition.icon or nil,
        sound = SyncNotify.Text(definition.sound, 32)
    }
    if not theme.accent and not theme.icon and not theme.sound then return nil end
    return theme
end
