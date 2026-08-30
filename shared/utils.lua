local function clamp(value, minimum, maximum)
    value = tonumber(value)
    if not value then return nil end
    return math.max(minimum, math.min(maximum, value))
end

local function text(value, maximum, fallback)
    if value == nil then return fallback end
    value = tostring(value):gsub('[%z\1-\8\11\12\14-\31]', '')
    if #value > maximum then value = value:sub(1, maximum) end
    return value
end

local function safeColor(value)
    if type(value) ~= 'string' then return nil end
    if value:match('^#%x%x%x%x%x%x$') then return value end
    return nil
end

local function copy(source, depth)
    if type(source) ~= 'table' or depth <= 0 then return nil end
    local result = {}
    for key, value in pairs(source) do
        if type(key) == 'string' or type(key) == 'number' then
            if type(value) == 'string' or type(value) == 'number' or type(value) == 'boolean' then
                result[key] = value
            elseif type(value) == 'table' then
                result[key] = copy(value, depth - 1)
            end
        end
    end
    return result
end

SyncNotify.Clamp = clamp
SyncNotify.Text = text
SyncNotify.SafeColor = safeColor
SyncNotify.SafeCopy = copy

