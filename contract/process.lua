-- YAO Optimizer - Autonomous Vault Process
-- AO Network Implementation

local config = require('config')
local utils = require('modules.utils')
local State = require('modules.state')

-- Initialize global state (centralized)
State.init()

-- Load modules
local json = require('json')
local YieldMonitor = require('modules.yield-monitor')

-- Deposit handler
local function depositHandler(msg)
    utils.log("Processing deposit from: " .. msg.From)

    -- Accept deposits only via Credit-Notice from the accepted token process
    if utils.isPaymentToken(msg.From) then
        local amount = tonumber(msg.Tags.Quantity)
        if not amount or amount <= 0 then
            ao.send({
                Target = msg.Sender,
                Action = "Deposit-Error",
                Error = "Invalid deposit amount"
            })
            return
        end
        
        -- Enforce minimum deposit
        if amount < (config.VAULT.MIN_DEPOSIT or 0) then
            ao.send({
                Target = msg.Sender,
                Action = "Deposit-Error",
                Error = "Amount below minimum deposit"
            })
            return
        end
        
        -- Calculate shares to mint using utils
        local s = State.get()
        local sharesToMint = utils.calculateSharesForDeposit(amount, s.totalShares, s.totalAssets)
        
        -- Update state via State module
        local state = State.get()
        local currentUserShares = State.getUserShares(msg.Sender)
        State.updateUserShares(msg.Sender, currentUserShares + sharesToMint)
        State.updateTotals(state.totalShares + sharesToMint, state.totalAssets + amount)
        
        -- Send confirmation
        local updated = State.get()
        ao.send({
            Target = msg.Sender,
            Action = "Deposit-Success",
            Amount = tostring(amount),
            Shares = tostring(sharesToMint),
            TotalShares = tostring(updated.totalShares)
        })
        
        utils.log("Deposit successful: " .. amount .. " tokens, " .. sharesToMint .. " shares minted")
        return
    else
        -- If this is a Credit-Notice from an unsupported token, refund it
        if msg.Tags and msg.Tags.Action == "Credit-Notice" then
            utils.returnTokens(msg, "Invalid token")
            return
        end
        -- Otherwise it's likely a direct Deposit call without funds; reject politely
        ao.send({
            Target = msg.Sender or msg.From,
            Action = "Deposit-Error",
            Error = "Deposits must be sent via token Transfer (Credit-Notice)"
        })
        return
    end
end

-- Withdraw handler
local function withdrawHandler(msg)
    utils.log("Processing withdrawal from: " .. msg.From)
    
    local sharesToBurn = tonumber(msg.Tags.Shares)
    if not sharesToBurn or sharesToBurn <= 0 then
        ao.send({
            Target = msg.From,
            Action = "Withdraw-Error",
            Error = "Invalid share amount"
        })
        return
    end
    
    local state = State.get()
    local userShares = State.getUserShares(msg.From)
    if sharesToBurn > userShares then
        ao.send({
            Target = msg.From,
            Action = "Withdraw-Error",
            Error = "Insufficient shares"
        })
        return
    end
    
    -- Calculate tokens to return using utils
    local tokensToReturn = utils.calculateAssetsForShares(sharesToBurn, state.totalShares, state.totalAssets)

    -- Enforce minimum withdrawal (by token amount)
    if tokensToReturn < (config.VAULT.MIN_WITHDRAWAL or 0) then
        ao.send({
            Target = msg.From,
            Action = "Withdraw-Error",
            Error = "Amount below minimum withdrawal"
        })
        return
    end
    
    -- Update state via State module
    State.updateUserShares(msg.From, userShares - sharesToBurn)
    State.updateTotals(state.totalShares - sharesToBurn, state.totalAssets - tokensToReturn)
    
    -- Transfer tokens back to user
    utils.sendTokens(config.VAULT.TOKEN_ID, msg.From, tostring(tokensToReturn), "Withdraw")
    
    -- Send confirmation
    local remainingShares = State.getUserShares(msg.From)
    ao.send({
        Target = msg.From,
        Action = "Withdraw-Success",
        Shares = tostring(sharesToBurn),
        Amount = tostring(tokensToReturn),
        RemainingShares = tostring(remainingShares)
    })
    
    utils.log("Withdrawal successful: " .. sharesToBurn .. " shares burned, " .. tokensToReturn .. " tokens returned")
end

-- Configuration handler
local function configureHandler(msg)
    utils.log("Processing configuration from: " .. msg.From)
    
    local config = {
        riskTolerance = msg.Tags.RiskTolerance or "medium",
        minYieldThreshold = tonumber(msg.Tags.MinYield) or 5.0,
        maxAllocation = tonumber(msg.Tags.MaxAllocation) or 50.0,
        autoCompound = msg.Tags.AutoCompound == "true",
        approvalRequired = msg.Tags.ApprovalRequired == "true"
    }
    
    State.setUserConfig(msg.From, config)
    
    ao.send({
        Target = msg.From,
        Action = "Configure-Success",
        Config = json.encode(config)
    })
    
    utils.log("Configuration updated for user: " .. msg.From)
end

-- Query handler
local function queryHandler(msg)
    utils.log("Processing query from: " .. msg.From)
    
    local userShares = State.getUserShares(msg.From) or 0
    local userValue = 0
    
    local s = State.get()
    if s.totalShares > 0 then
        userValue = (userShares * s.totalAssets) / s.totalShares
    end
    
    local response = {
        shares = userShares,
        value = userValue,
        totalVaultShares = s.totalShares,
        totalVaultAssets = s.totalAssets,
        config = State.getUserConfig(msg.From) or {}
    }
    
    ao.send({
        Target = msg.From,
        Action = "Query-Response",
        Data = json.encode(response)
    })
    
    utils.log("Query response sent to: " .. msg.From)
end

-- Info handler for vault status
local function infoHandler(msg)
    utils.log("Processing info request from: " .. msg.From)
    
    local s = State.get()
    local info = {
        version = s.version,
        totalShares = s.totalShares,
        totalAssets = s.totalAssets,
        userCount = 0,
        emergencyMode = s.emergencyMode,
        lastRebalance = s.lastRebalance
    }
    
    -- Count users
    local state = State.get()
    for _ in pairs(state.userShares) do
        info.userCount = info.userCount + 1
    end
    
    ao.send({
        Target = msg.From,
        Action = "Info-Response",
        Data = json.encode(info)
    })
    
    utils.log("Info response sent to: " .. msg.From)
end

-- Yield scanning handler
local function scanYieldsHandler(msg)
    utils.log("Processing yield scan request from: " .. msg.From)
    
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
    
    utils.log("Yield scan completed: " .. result.success .. " successful, " .. result.errors .. " errors")
end

-- Pool data update handler
local function updatePoolDataHandler(msg)
    utils.log("Processing pool data update from: " .. msg.From)
    
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
    
    utils.log("Pool data updated for: " .. poolId)
end

-- Pool health check handler
local function poolHealthHandler(msg)
    utils.log("Processing pool health check from: " .. msg.From)
    
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
    
    utils.log("Pool health check completed")
end

-- Yield monitor stats handler
local function yieldStatsHandler(msg)
    utils.log("Processing yield stats request from: " .. msg.From)
    
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
    
    utils.log("Yield stats sent to: " .. msg.From)
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
utils.log("YAO Optimizer Vault Process initialized")
utils.log("Version: " .. State.get().version)

-- Initialize yield monitoring
YieldMonitor.init()
utils.log("Yield monitoring system initialized")

utils.log("Ready to accept deposits and manage autonomous yield optimization")