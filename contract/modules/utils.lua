
local config = require('config')

local Utils = {}

-- Logging utility
function Utils.log(message, level)
    level = level or "INFO"
    local timestamp = os.date("%Y-%m-%d %H:%M:%S")
    print("[" .. timestamp .. "] [" .. level .. "] [VAULT] " .. tostring(message))
end

function Utils.sendTokens(token, recipient, quantity, note)
    ao.send({
        Target     = token,
        Action     = "Transfer",
        Recipient  = recipient,
        Quantity   = quantity,
        ["X-Note"] = note or "Sending tokens from Random Process"
    })
end

function Utils.returnTokens(msg, errMessage)
    local qty = msg.Quantity or (msg.Tags and msg.Tags.Quantity) or "0"
    local sender = msg.Sender or (msg.Tags and msg.Tags.Sender) or nil
    Utils.sendTokens(msg.From, sender or "", qty, errMessage)
end

-- Address validation
function Utils.validateAddress(address)
    return address and type(address) == "string" and #address > 0
end

-- Token helpers
function Utils.isPaymentToken(token)
    return config.VAULT.TOKEN_ID == token or false
end

-- Number validation and conversion
function Utils.toNumber(value, default)
    local num = tonumber(value)
    return num or default or 0
end

function Utils.isValidAmount(amount)
    local num = tonumber(amount)
    return num and num > 0
end

-- Percentage calculations
function Utils.calculatePercentage(part, total)
    if total == 0 then return 0 end
    return (part / total) * 100
end

-- Share calculations
function Utils.calculateSharesForDeposit(depositAmount, totalShares, totalAssets)
    if totalShares == 0 or totalAssets == 0 then
        return depositAmount -- First deposit gets 1:1 ratio
    end
    return (depositAmount * totalShares) / totalAssets
end

function Utils.calculateAssetsForShares(shareAmount, totalShares, totalAssets)
    if totalShares == 0 then return 0 end
    return (shareAmount * totalAssets) / totalShares
end

-- Time utilities
function Utils.getCurrentTimestamp()
    return os.time()
end

function Utils.formatTimestamp(timestamp)
    return os.date("%Y-%m-%d %H:%M:%S", timestamp)
end

-- Configuration validation
function Utils.validateRiskTolerance(riskTolerance)
    local validLevels = {low = true, medium = true, high = true}
    return validLevels[riskTolerance] ~= nil
end

function Utils.validateYieldThreshold(threshold)
    local num = tonumber(threshold)
    return num and num >= 0 and num <= 100
end

function Utils.validateAllocationLimit(limit)
    local num = tonumber(limit)
    return num and num > 0 and num <= 100
end

-- Error handling
function Utils.createErrorResponse(target, errorMessage, errorCode)
    return {
        Target = target,
        Action = "Error",
        Error = errorMessage,
        Code = errorCode or "UNKNOWN_ERROR"
    }
end

function Utils.createSuccessResponse(target, action, data)
    local response = {
        Target = target,
        Action = action .. "-Success"
    }
    
    if data then
        for key, value in pairs(data) do
            response[key] = value
        end
    end
    
    return response
end

-- JSON utilities (assuming json library is available)
function Utils.safeJsonEncode(data)
    local success, result = pcall(function()
        return require('json').encode(data)
    end)
    
    if success then
        return result
    else
        Utils.log("JSON encoding failed: " .. tostring(result), "ERROR")
        return "{\"error\":\"JSON encoding failed\"}"
    end
end

function Utils.safeJsonDecode(jsonString)
    local success, result = pcall(function()
        return require('json').decode(jsonString)
    end)
    
    if success then
        return result
    else
        Utils.log("JSON decoding failed: " .. tostring(result), "ERROR")
        return nil
    end
end

-- Table utilities
function Utils.tableLength(t)
    local count = 0
    for _ in pairs(t) do
        count = count + 1
    end
    return count
end

function Utils.deepCopy(original)
    local copy = {}
    for key, value in pairs(original) do
        if type(value) == "table" then
            copy[key] = Utils.deepCopy(value)
        else
            copy[key] = value
        end
    end
    return copy
end

return Utils