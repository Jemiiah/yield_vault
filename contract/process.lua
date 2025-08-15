-- YAO Optimizer - Autonomous Vault Process
-- AO Network Implementation

-- Initialize global state
if not State then
    State = {
        totalShares = 0,
        totalAssets = 0,
        userShares = {},
        poolAllocations = {},
        userConfigs = {},
        lastRebalance = 0,
        emergencyMode = false,
        version = "0.1.0"
    }
end

-- Load modules
local json = require('json')

local function log(message)
    print("[VAULT] " .. tostring(message))
end

-- Deposit handler
local function depositHandler(msg)
    log("Processing deposit from: " .. msg.From)
    
    local amount = tonumber(msg.Tags.Amount)
    if not amount or amount <= 0 then
        ao.send({
            Target = msg.From,
            Action = "Deposit-Error",
            Error = "Invalid deposit amount"
        })
        return
    end
    
    -- Calculate shares to mint (simplified for now)
    local sharesToMint = amount
    if State.totalShares > 0 then
        sharesToMint = (amount * State.totalShares) / State.totalAssets
    end
    
    -- Update state
    State.userShares[msg.From] = (State.userShares[msg.From] or 0) + sharesToMint
    State.totalShares = State.totalShares + sharesToMint
    State.totalAssets = State.totalAssets + amount
    
    -- Send confirmation
    ao.send({
        Target = msg.From,
        Action = "Deposit-Success",
        Amount = tostring(amount),
        Shares = tostring(sharesToMint),
        TotalShares = tostring(State.totalShares)
    })
    
    log("Deposit successful: " .. amount .. " tokens, " .. sharesToMint .. " shares minted")
end

-- Withdraw handler
local function withdrawHandler(msg)
    log("Processing withdrawal from: " .. msg.From)
    
    local sharesToBurn = tonumber(msg.Tags.Shares)
    if not sharesToBurn or sharesToBurn <= 0 then
        ao.send({
            Target = msg.From,
            Action = "Withdraw-Error",
            Error = "Invalid share amount"
        })
        return
    end
    
    local userShares = State.userShares[msg.From] or 0
    if sharesToBurn > userShares then
        ao.send({
            Target = msg.From,
            Action = "Withdraw-Error",
            Error = "Insufficient shares"
        })
        return
    end
    
    -- Calculate tokens to return
    local tokensToReturn = (sharesToBurn * State.totalAssets) / State.totalShares
    
    -- Update state
    State.userShares[msg.From] = userShares - sharesToBurn
    State.totalShares = State.totalShares - sharesToBurn
    State.totalAssets = State.totalAssets - tokensToReturn
    
    -- Send confirmation
    ao.send({
        Target = msg.From,
        Action = "Withdraw-Success",
        Shares = tostring(sharesToBurn),
        Amount = tostring(tokensToReturn),
        RemainingShares = tostring(State.userShares[msg.From])
    })
    
    log("Withdrawal successful: " .. sharesToBurn .. " shares burned, " .. tokensToReturn .. " tokens returned")
end

-- Configuration handler
local function configureHandler(msg)
    log("Processing configuration from: " .. msg.From)
    
    local config = {
        riskTolerance = msg.Tags.RiskTolerance or "medium",
        minYieldThreshold = tonumber(msg.Tags.MinYield) or 5.0,
        maxAllocation = tonumber(msg.Tags.MaxAllocation) or 50.0,
        autoCompound = msg.Tags.AutoCompound == "true",
        approvalRequired = msg.Tags.ApprovalRequired == "true"
    }
    
    State.userConfigs[msg.From] = config
    
    ao.send({
        Target = msg.From,
        Action = "Configure-Success",
        Config = json.encode(config)
    })
    
    log("Configuration updated for user: " .. msg.From)
end

-- Query handler
local function queryHandler(msg)
    log("Processing query from: " .. msg.From)
    
    local userShares = State.userShares[msg.From] or 0
    local userValue = 0
    
    if State.totalShares > 0 then
        userValue = (userShares * State.totalAssets) / State.totalShares
    end
    
    local response = {
        shares = userShares,
        value = userValue,
        totalVaultShares = State.totalShares,
        totalVaultAssets = State.totalAssets,
        config = State.userConfigs[msg.From] or {}
    }
    
    ao.send({
        Target = msg.From,
        Action = "Query-Response",
        Data = json.encode(response)
    })
    
    log("Query response sent to: " .. msg.From)
end

-- Info handler for vault status
local function infoHandler(msg)
    log("Processing info request from: " .. msg.From)
    
    local info = {
        version = State.version,
        totalShares = State.totalShares,
        totalAssets = State.totalAssets,
        userCount = 0,
        emergencyMode = State.emergencyMode,
        lastRebalance = State.lastRebalance
    }
    
    -- Count users
    for _ in pairs(State.userShares) do
        info.userCount = info.userCount + 1
    end
    
    ao.send({
        Target = msg.From,
        Action = "Info-Response",
        Data = json.encode(info)
    })
    
    log("Info response sent to: " .. msg.From)
end

-- Main message handler
Handlers.add(
    "Deposit",
    Handlers.utils.hasMatchingTag("Action", "Deposit"),
    depositHandler
)

Handlers.add(
    "Withdraw", 
    Handlers.utils.hasMatchingTag("Action", "Withdraw"),
    withdrawHandler
)

Handlers.add(
    "Configure",
    Handlers.utils.hasMatchingTag("Action", "Configure"), 
    configureHandler
)

Handlers.add(
    "Query",
    Handlers.utils.hasMatchingTag("Action", "Query"),
    queryHandler
)

Handlers.add(
    "Info",
    Handlers.utils.hasMatchingTag("Action", "Info"),
    infoHandler
)

-- Initialize process
log("YAO Optimizer Vault Process initialized")
log("Version: " .. State.version)
log("Ready to accept deposits and manage autonomous yield optimization")