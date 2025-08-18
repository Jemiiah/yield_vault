-- YAO Optimizer - Autonomous Vault Process
-- AO Network Implementation

local config = require('config')
local utils = require('modules.utils')

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
local YieldMonitor = require('modules.yield-monitor')

local function log(message)
    print("[VAULT] " .. tostring(message))
end

local function validateAddress(address)
    return address and type(address) == "string" and #address > 0
end

local function isPaymentToken(token)
    return config.VAULT.TOKEN_ID == token or false
end

local function getCurrentTimestamp()
    return os.time()
end

-- Deposit handler
local function depositHandler(msg)
    log("Processing deposit from: " .. msg.From)

    if isPaymentToken(msg.From) then
        local amount = tonumber(msg.Tags.Amount)
        if not amount or amount <= 0 then
            ao.send({
                Target = msg.Sender,
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
        State.userShares[msg.Sender] = (State.userShares[msg.Sender] or 0) + sharesToMint
        State.totalShares = State.totalShares + sharesToMint
        State.totalAssets = State.totalAssets + amount
        
        -- Send confirmation
        ao.send({
            Target = msg.Sender,
            Action = "Deposit-Success",
            Amount = tostring(amount),
            Shares = tostring(sharesToMint),
            TotalShares = tostring(State.totalShares)
        })
        
        log("Deposit successful: " .. amount .. " tokens, " .. sharesToMint .. " shares minted")
    end

    utils.returnTokens(msg, "Invalid token")
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

-- Yield scanning handler
local function scanYieldsHandler(msg)
    log("Processing yield scan request from: " .. msg.From)
    
    -- Initialize yield monitor if needed
    YieldMonitor.init()
    
    local result = YieldMonitor.scanYields()
    
    ao.send({
        Target = msg.From,
        Action = "Scan-Yields-Response",
        Success = tostring(result.success),
        Errors = tostring(result.errors),
        Timestamp = tostring(result.timestamp),
        Data = json.encode(result)
    })
    
    log("Yield scan completed: " .. result.success .. " successful, " .. result.errors .. " errors")
end

-- Pool data update handler
local function updatePoolDataHandler(msg)
    log("Processing pool data update from: " .. msg.From)
    
    local poolId = msg.Tags.PoolId
    if not poolId then
        ao.send({
            Target = msg.From,
            Action = "Update-Pool-Error",
            Error = "Missing PoolId"
        })
        return
    end
    
    -- Initialize yield monitor if needed
    YieldMonitor.init()
    
    -- Extract pool data from message tags
    local poolData = {
        id = poolId,
        name = msg.Tags.Name,
        currentAPY = msg.Tags.APY,
        tvl = msg.Tags.TVL,
        riskScore = msg.Tags.RiskScore,
        isActive = msg.Tags.IsActive == "true"
    }
    
    -- Parse supported tokens if provided
    if msg.Tags.SupportedTokens then
        local success, tokens = pcall(function()
            return json.decode(msg.Tags.SupportedTokens)
        end)
        if success then
            poolData.supportedTokens = tokens
        end
    end
    
    -- Validate and update pool data
    local isValid, errors = YieldMonitor.validatePoolData(poolData)
    if not isValid then
        ao.send({
            Target = msg.From,
            Action = "Update-Pool-Error",
            Error = "Validation failed: " .. table.concat(errors, ", ")
        })
        return
    end
    
    local updatedPool = YieldMonitor.updatePoolInfo(poolId, poolData)
    
    ao.send({
        Target = msg.From,
        Action = "Update-Pool-Success",
        PoolId = poolId,
        HealthStatus = updatedPool.healthStatus,
        Data = json.encode(updatedPool)
    })
    
    log("Pool data updated for: " .. poolId)
end

-- Pool health check handler
local function poolHealthHandler(msg)
    log("Processing pool health check from: " .. msg.From)
    
    -- Initialize yield monitor if needed
    YieldMonitor.init()
    
    local poolId = msg.Tags.PoolId
    
    if poolId then
        -- Check specific pool
        local pool = YieldMonitor.getPoolInfo(poolId)
        if pool then
            YieldMonitor.updatePoolHealth(poolId)
            ao.send({
                Target = msg.From,
                Action = "Pool-Health-Response",
                PoolId = poolId,
                HealthStatus = pool.healthStatus,
                Data = json.encode(pool)
            })
        else
            ao.send({
                Target = msg.From,
                Action = "Pool-Health-Error",
                Error = "Pool not found: " .. poolId
            })
        end
    else
        -- Return health status for all pools
        local stats = YieldMonitor.getStats()
        ao.send({
            Target = msg.From,
            Action = "Pool-Health-Response",
            Data = json.encode(stats)
        })
    end
    
    log("Pool health check completed")
end

-- Yield monitor stats handler
local function yieldStatsHandler(msg)
    log("Processing yield stats request from: " .. msg.From)
    
    -- Initialize yield monitor if needed
    YieldMonitor.init()
    
    local stats = YieldMonitor.getStats()
    local allPools = YieldMonitor.getAllPools()
    
    ao.send({
        Target = msg.From,
        Action = "Yield-Stats-Response",
        Data = json.encode({
            stats = stats,
            pools = allPools
        })
    })
    
    log("Yield stats sent to: " .. msg.From)
end

-- Expose Handlers for testing
ProcessHandlers = {
    depositHandler = depositHandler,
    withdrawHandler = withdrawHandler,
    configureHandler = configureHandler,
    queryHandler = queryHandler,
    infoHandler = infoHandler,
    scanYieldsHandler = scanYieldsHandler,
    updatePoolDataHandler = updatePoolDataHandler,
    poolHealthHandler = poolHealthHandler,
    yieldStatsHandler = yieldStatsHandler
}

-- Main message handler
Handlers.add(
    "Deposit",
    Handlers.utils.hasMatchingTag("Action", "Deposit"),
    depositHandler
)

Handlers.add(
    "creditNotice",
    Handlers.utils.hasMatchingTag("Action", "Credit-Notice"),
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

-- Yield monitoring handlers
Handlers.add(
    "ScanYields",
    Handlers.utils.hasMatchingTag("Action", "Scan-Yields"),
    scanYieldsHandler
)

Handlers.add(
    "UpdatePoolData",
    Handlers.utils.hasMatchingTag("Action", "Update-Pool"),
    updatePoolDataHandler
)

Handlers.add(
    "PoolHealth",
    Handlers.utils.hasMatchingTag("Action", "Pool-Health"),
    poolHealthHandler
)

Handlers.add(
    "YieldStats",
    Handlers.utils.hasMatchingTag("Action", "Yield-Stats"),
    yieldStatsHandler
)

-- Initialize process
log("YAO Optimizer Vault Process initialized")
log("Version: " .. State.version)

-- Initialize yield monitoring
YieldMonitor.init()
log("Yield monitoring system initialized")

log("Ready to accept deposits and manage autonomous yield optimization")