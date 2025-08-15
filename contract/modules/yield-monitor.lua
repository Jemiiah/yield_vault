-- Yield Monitor Module for YAO Optimizer
-- Handles yield scanning, pool data collection, and health monitoring

local YieldMonitor = {}
local Utils = require('modules.utils')

-- Pool data structure
local function createPoolInfo(id, name, currentAPY, tvl, riskScore, supportedTokens)
    return {
        id = id or "",
        name = name or "Unknown Pool",
        currentAPY = tonumber(currentAPY) or 0,
        tvl = tonumber(tvl) or 0,
        riskScore = tonumber(riskScore) or 5, -- 1-10 scale
        lastUpdated = Utils.getCurrentTimestamp(),
        isActive = true,
        supportedTokens = supportedTokens or {"AstroUSD"},
        healthStatus = "unknown", -- healthy, warning, critical, unknown
        historicalAPY = {}, -- Store last 10 APY readings
        errorCount = 0,
        lastError = nil
    }
end

-- Initialize yield monitoring state
function YieldMonitor.init()
    if not _G.State.yieldMonitor then
        _G.State.yieldMonitor = {
            pools = {}, -- poolId -> PoolInfo
            lastScan = 0,
            scanInterval = 300, -- 5 minutes in seconds
            isScanning = false,
            scanErrors = 0,
            maxRetries = 3,
            knownPools = {
                -- Default AO network pools (these would be real pool IDs in production)
                "botega-pool-1",
                "astro-yield-pool",
                "ao-defi-pool-alpha"
            }
        }
    end
    return _G.State.yieldMonitor
end

-- Get yield monitoring state
function YieldMonitor.getState()
    return _G.State.yieldMonitor or YieldMonitor.init()
end

-- Add or update pool information
function YieldMonitor.updatePoolInfo(poolId, poolData)
    local state = YieldMonitor.getState()
    
    if not state.pools[poolId] then
        state.pools[poolId] = createPoolInfo(poolId)
    end
    
    local pool = state.pools[poolId]
    
    -- Update pool data
    if poolData.name then pool.name = poolData.name end
    if poolData.currentAPY then 
        -- Store historical APY data
        table.insert(pool.historicalAPY, {
            apy = tonumber(poolData.currentAPY),
            timestamp = Utils.getCurrentTimestamp()
        })
        
        -- Keep only last 10 readings
        if #pool.historicalAPY > 10 then
            table.remove(pool.historicalAPY, 1)
        end
        
        pool.currentAPY = tonumber(poolData.currentAPY)
    end
    if poolData.tvl then pool.tvl = tonumber(poolData.tvl) end
    if poolData.riskScore then pool.riskScore = tonumber(poolData.riskScore) end
    if poolData.supportedTokens then pool.supportedTokens = poolData.supportedTokens end
    if poolData.isActive ~= nil then pool.isActive = poolData.isActive end
    
    pool.lastUpdated = Utils.getCurrentTimestamp()
    pool.errorCount = 0 -- Reset error count on successful update
    pool.lastError = nil
    
    -- Update health status based on data
    YieldMonitor.updatePoolHealth(poolId)
    
    Utils.log("Updated pool info for: " .. poolId .. " (APY: " .. pool.currentAPY .. "%)")
    return pool
end

-- Update pool health status
function YieldMonitor.updatePoolHealth(poolId)
    local state = YieldMonitor.getState()
    local pool = state.pools[poolId]
    
    if not pool then return end
    
    local now = Utils.getCurrentTimestamp()
    local timeSinceUpdate = now - pool.lastUpdated
    
    -- Determine health status
    if pool.errorCount > 2 then
        pool.healthStatus = "critical"
    elseif timeSinceUpdate > 1800 then -- 30 minutes without update
        pool.healthStatus = "warning"
    elseif pool.currentAPY < 0 then
        pool.healthStatus = "warning"
    elseif pool.tvl < 1000 then -- Low TVL threshold
        pool.healthStatus = "warning"
    else
        pool.healthStatus = "healthy"
    end
    
    Utils.log("Pool " .. poolId .. " health status: " .. pool.healthStatus)
end

-- Record pool error
function YieldMonitor.recordPoolError(poolId, error)
    local state = YieldMonitor.getState()
    
    if not state.pools[poolId] then
        state.pools[poolId] = createPoolInfo(poolId)
    end
    
    local pool = state.pools[poolId]
    pool.errorCount = pool.errorCount + 1
    pool.lastError = {
        message = tostring(error),
        timestamp = Utils.getCurrentTimestamp()
    }
    
    YieldMonitor.updatePoolHealth(poolId)
    Utils.log("Recorded error for pool " .. poolId .. ": " .. tostring(error), "ERROR")
end

-- Get pool information
function YieldMonitor.getPoolInfo(poolId)
    local state = YieldMonitor.getState()
    return state.pools[poolId]
end

-- Get all pools
function YieldMonitor.getAllPools()
    local state = YieldMonitor.getState()
    return state.pools
end

-- Get healthy pools only
function YieldMonitor.getHealthyPools()
    local state = YieldMonitor.getState()
    local healthyPools = {}
    
    for poolId, pool in pairs(state.pools) do
        if pool.isActive and pool.healthStatus == "healthy" then
            healthyPools[poolId] = pool
        end
    end
    
    return healthyPools
end

-- Validate pool data
function YieldMonitor.validatePoolData(poolData)
    local errors = {}
    
    if not poolData.id or type(poolData.id) ~= "string" or #poolData.id == 0 then
        table.insert(errors, "Invalid or missing pool ID")
    end
    
    if poolData.currentAPY then
        local apy = tonumber(poolData.currentAPY)
        if not apy or apy < -100 or apy > 1000 then
            table.insert(errors, "Invalid APY value (must be between -100% and 1000%)")
        end
    end
    
    if poolData.tvl then
        local tvl = tonumber(poolData.tvl)
        if not tvl or tvl < 0 then
            table.insert(errors, "Invalid TVL value (must be non-negative)")
        end
    end
    
    if poolData.riskScore then
        local risk = tonumber(poolData.riskScore)
        if not risk or risk < 1 or risk > 10 then
            table.insert(errors, "Invalid risk score (must be between 1 and 10)")
        end
    end
    
    return #errors == 0, errors
end

-- Simulate pool data query (in production, this would query actual AO processes)
function YieldMonitor.queryPoolData(poolId)
    Utils.log("Querying pool data for: " .. poolId)
    
    -- Simulate different pool responses for testing
    local mockData = {
        ["botega-pool-1"] = {
            id = "botega-pool-1",
            name = "Botega Yield Pool",
            currentAPY = 12.5 + math.random(-2, 3), -- Simulate APY fluctuation
            tvl = 150000 + math.random(-10000, 20000),
            riskScore = 3,
            supportedTokens = {"AstroUSD", "AR"},
            isActive = true
        },
        ["astro-yield-pool"] = {
            id = "astro-yield-pool",
            name = "AstroUSD Yield Pool",
            currentAPY = 8.2 + math.random(-1, 2),
            tvl = 75000 + math.random(-5000, 10000),
            riskScore = 2,
            supportedTokens = {"AstroUSD"},
            isActive = true
        },
        ["ao-defi-pool-alpha"] = {
            id = "ao-defi-pool-alpha",
            name = "AO DeFi Alpha Pool",
            currentAPY = 18.7 + math.random(-3, 5),
            tvl = 45000 + math.random(-5000, 8000),
            riskScore = 7,
            supportedTokens = {"AstroUSD", "AR", "CRED"},
            isActive = math.random() > 0.1 -- 90% uptime simulation
        }
    }
    
    local poolData = mockData[poolId]
    if not poolData then
        error("Pool not found: " .. poolId)
    end
    
    -- Simulate network delay
    -- In real implementation, this would be an async AO message
    return poolData
end

-- Scan all known pools for yield data
function YieldMonitor.scanYields()
    local state = YieldMonitor.getState()
    
    if state.isScanning then
        Utils.log("Yield scan already in progress, skipping", "WARNING")
        return false
    end
    
    state.isScanning = true
    state.lastScan = Utils.getCurrentTimestamp()
    
    Utils.log("Starting yield scan for " .. #state.knownPools .. " pools")
    
    local successCount = 0
    local errorCount = 0
    
    for _, poolId in ipairs(state.knownPools) do
        local success, result = pcall(function()
            local poolData = YieldMonitor.queryPoolData(poolId)
            local isValid, errors = YieldMonitor.validatePoolData(poolData)
            
            if isValid then
                YieldMonitor.updatePoolInfo(poolId, poolData)
                return true
            else
                error("Validation failed: " .. table.concat(errors, ", "))
            end
        end)
        
        if success then
            successCount = successCount + 1
        else
            errorCount = errorCount + 1
            YieldMonitor.recordPoolError(poolId, result)
        end
    end
    
    state.isScanning = false
    state.scanErrors = errorCount
    
    Utils.log("Yield scan completed: " .. successCount .. " successful, " .. errorCount .. " errors")
    
    return {
        success = successCount,
        errors = errorCount,
        timestamp = state.lastScan
    }
end

-- Get yield monitoring statistics
function YieldMonitor.getStats()
    local state = YieldMonitor.getState()
    local stats = {
        totalPools = 0,
        healthyPools = 0,
        warningPools = 0,
        criticalPools = 0,
        lastScan = state.lastScan,
        scanErrors = state.scanErrors,
        isScanning = state.isScanning,
        averageAPY = 0,
        totalTVL = 0
    }
    
    local apySum = 0
    local activePoolCount = 0
    
    for _, pool in pairs(state.pools) do
        stats.totalPools = stats.totalPools + 1
        
        if pool.isActive then
            activePoolCount = activePoolCount + 1
            apySum = apySum + pool.currentAPY
            stats.totalTVL = stats.totalTVL + pool.tvl
            
            if pool.healthStatus == "healthy" then
                stats.healthyPools = stats.healthyPools + 1
            elseif pool.healthStatus == "warning" then
                stats.warningPools = stats.warningPools + 1
            elseif pool.healthStatus == "critical" then
                stats.criticalPools = stats.criticalPools + 1
            end
        end
    end
    
    if activePoolCount > 0 then
        stats.averageAPY = apySum / activePoolCount
    end
    
    return stats
end

-- Check if yield scan is needed
function YieldMonitor.shouldScan()
    local state = YieldMonitor.getState()
    local now = Utils.getCurrentTimestamp()
    return (now - state.lastScan) >= state.scanInterval and not state.isScanning
end

return YieldMonitor