-- Strategy Execution Engine for YAO Optimizer
-- Handles automated rebalancing, yield optimization, and strategy execution

local StrategyEngine = {}
local Utils = require('modules.utils')
local YieldMonitor = require('modules.yield-monitor')

-- Strategy types
local STRATEGY_TYPES = {
    CONSERVATIVE = "conservative",
    BALANCED = "balanced", 
    AGGRESSIVE = "aggressive",
    CUSTOM = "custom"
}

-- Rebalancing triggers
local REBALANCE_TRIGGERS = {
    TIME_BASED = "time_based",
    YIELD_THRESHOLD = "yield_threshold",
    RISK_CHANGE = "risk_change",
    MANUAL = "manual"
}

-- Initialize strategy engine state
function StrategyEngine.init()
    if not _G.State.strategyEngine then
        _G.State.strategyEngine = {
            activeStrategies = {}, -- userId -> strategy config
            rebalanceHistory = {},
            lastRebalance = 0,
            rebalanceInterval = 3600, -- 1 hour in seconds
            isRebalancing = false,
            totalRebalances = 0,
            failedRebalances = 0,
            settings = {
                maxSlippage = 0.02, -- 2%
                minYieldDifference = 0.5, -- 0.5% minimum yield difference to trigger rebalance
                maxAllocationPerPool = 0.4, -- 40% max allocation to single pool
                emergencyExitThreshold = -0.1 -- -10% loss triggers emergency exit
            }
        }
    end
    return _G.State.strategyEngine
end

-- Get strategy engine state
function StrategyEngine.getState()
    return _G.State.strategyEngine or StrategyEngine.init()
end

-- Create default strategy configuration
function StrategyEngine.createDefaultStrategy(strategyType, userAddress)
    local strategies = {
        [STRATEGY_TYPES.CONSERVATIVE] = {
            type = STRATEGY_TYPES.CONSERVATIVE,
            riskTolerance = "low",
            targetAPY = 5.0,
            maxRiskScore = 3,
            preferredCategories = {"stable_yield", "lending"},
            rebalanceThreshold = 1.0, -- 1% yield difference
            maxAllocationPerPool = 0.3,
            autoCompound = true,
            emergencyExitEnabled = true
        },
        [STRATEGY_TYPES.BALANCED] = {
            type = STRATEGY_TYPES.BALANCED,
            riskTolerance = "medium",
            targetAPY = 10.0,
            maxRiskScore = 6,
            preferredCategories = {"stable_yield", "lending", "liquidity_provision"},
            rebalanceThreshold = 0.75,
            maxAllocationPerPool = 0.4,
            autoCompound = true,
            emergencyExitEnabled = true
        },
        [STRATEGY_TYPES.AGGRESSIVE] = {
            type = STRATEGY_TYPES.AGGRESSIVE,
            riskTolerance = "high",
            targetAPY = 20.0,
            maxRiskScore = 10,
            preferredCategories = {"liquidity_provision", "arbitrage", "governance"},
            rebalanceThreshold = 0.5,
            maxAllocationPerPool = 0.5,
            autoCompound = true,
            emergencyExitEnabled = false
        }
    }
    
    local strategy = strategies[strategyType]
    if not strategy then
        error("Unknown strategy type: " .. tostring(strategyType))
    end
    
    strategy.userAddress = userAddress
    strategy.createdAt = Utils.getCurrentTimestamp()
    strategy.lastRebalance = 0
    strategy.isActive = true
    
    return strategy
end

-- Set user strategy
function StrategyEngine.setUserStrategy(userAddress, strategyConfig)
    local state = StrategyEngine.getState()
    
    -- Validate strategy config
    local isValid, errors = StrategyEngine.validateStrategy(strategyConfig)
    if not isValid then
        error("Invalid strategy configuration: " .. table.concat(errors, ", "))
    end
    
    strategyConfig.userAddress = userAddress
    strategyConfig.lastUpdated = Utils.getCurrentTimestamp()
    
    state.activeStrategies[userAddress] = strategyConfig
    
    Utils.log("Strategy set for user " .. userAddress .. ": " .. strategyConfig.type)
    return strategyConfig
end

-- Get user strategy
function StrategyEngine.getUserStrategy(userAddress)
    local state = StrategyEngine.getState()
    return state.activeStrategies[userAddress]
end

-- Validate strategy configuration
function StrategyEngine.validateStrategy(strategy)
    local errors = {}
    
    if not strategy.type or not STRATEGY_TYPES[string.upper(strategy.type)] then
        table.insert(errors, "Invalid strategy type")
    end
    
    if strategy.targetAPY and (strategy.targetAPY < 0 or strategy.targetAPY > 100) then
        table.insert(errors, "Target APY must be between 0% and 100%")
    end
    
    if strategy.maxRiskScore and (strategy.maxRiskScore < 1 or strategy.maxRiskScore > 10) then
        table.insert(errors, "Max risk score must be between 1 and 10")
    end
    
    if strategy.maxAllocationPerPool and (strategy.maxAllocationPerPool <= 0 or strategy.maxAllocationPerPool > 1) then
        table.insert(errors, "Max allocation per pool must be between 0 and 1")
    end
    
    return #errors == 0, errors
end

-- Calculate optimal allocation based on strategy
function StrategyEngine.calculateOptimalAllocation(userAddress, availableAmount)
    local strategy = StrategyEngine.getUserStrategy(userAddress)
    if not strategy then
        error("No strategy found for user: " .. userAddress)
    end
    
    -- Get healthy pools that match strategy criteria
    local suitablePools = StrategyEngine.getSuitablePools(strategy)
    
    if #suitablePools == 0 then
        Utils.log("No suitable pools found for strategy", "WARNING")
        return {}
    end
    
    -- Calculate allocation weights based on yield and risk
    local allocations = {}
    local totalWeight = 0
    
    for _, pool in ipairs(suitablePools) do
        local weight = StrategyEngine.calculatePoolWeight(pool, strategy)
        allocations[pool.id] = {
            pool = pool,
            weight = weight,
            allocation = 0 -- Will be calculated below
        }
        totalWeight = totalWeight + weight
    end
    
    -- Distribute available amount based on weights
    for poolId, allocation in pairs(allocations) do
        local percentage = allocation.weight / totalWeight
        local maxAllocation = availableAmount * strategy.maxAllocationPerPool
        
        allocation.allocation = math.min(
            availableAmount * percentage,
            maxAllocation
        )
    end
    
    Utils.log("Calculated optimal allocation for " .. #suitablePools .. " pools")
    return allocations
end

-- Get pools suitable for strategy
function StrategyEngine.getSuitablePools(strategy)
    local allPools = YieldMonitor.getHealthyPools()
    local suitablePools = {}
    
    for poolId, pool in pairs(allPools) do
        -- Check risk tolerance
        if pool.riskScore <= strategy.maxRiskScore then
            -- Check category preference
            local categoryMatch = false
            if strategy.preferredCategories then
                for _, category in ipairs(strategy.preferredCategories) do
                    if pool.category == category then
                        categoryMatch = true
                        break
                    end
                end
            else
                categoryMatch = true -- No category restriction
            end
            
            if categoryMatch then
                table.insert(suitablePools, pool)
            end
        end
    end
    
    -- Sort by APY descending
    table.sort(suitablePools, function(a, b)
        return a.currentAPY > b.currentAPY
    end)
    
    return suitablePools
end

-- Calculate weight for pool allocation
function StrategyEngine.calculatePoolWeight(pool, strategy)
    local apyWeight = pool.currentAPY / 100 -- Normalize APY
    local riskPenalty = (pool.riskScore - 1) / 9 -- Normalize risk score (1-10 to 0-1)
    local tvlBonus = math.min(pool.tvl / 1000000, 1) -- TVL bonus up to 1M
    
    -- Adjust weights based on strategy type
    local weight = apyWeight
    
    if strategy.type == STRATEGY_TYPES.CONSERVATIVE then
        weight = weight * (1 - riskPenalty * 0.8) * (1 + tvlBonus * 0.3)
    elseif strategy.type == STRATEGY_TYPES.BALANCED then
        weight = weight * (1 - riskPenalty * 0.5) * (1 + tvlBonus * 0.2)
    elseif strategy.type == STRATEGY_TYPES.AGGRESSIVE then
        weight = weight * (1 - riskPenalty * 0.2) * (1 + tvlBonus * 0.1)
    end
    
    return math.max(weight, 0.01) -- Minimum weight
end

-- Check if rebalancing is needed
function StrategyEngine.shouldRebalance(userAddress)
    local strategy = StrategyEngine.getUserStrategy(userAddress)
    if not strategy or not strategy.isActive then
        return false, "No active strategy"
    end
    
    local state = StrategyEngine.getState()
    local now = Utils.getCurrentTimestamp()
    
    -- Time-based rebalancing
    if (now - strategy.lastRebalance) >= state.rebalanceInterval then
        return true, REBALANCE_TRIGGERS.TIME_BASED
    end
    
    -- Yield threshold rebalancing
    local currentAllocations = StrategyEngine.getCurrentAllocations(userAddress)
    local optimalAllocations = StrategyEngine.calculateOptimalAllocation(userAddress, 100) -- Use percentage
    
    local maxYieldDifference = 0
    for poolId, optimal in pairs(optimalAllocations) do
        local current = currentAllocations[poolId] or {allocation = 0}
        local yieldDifference = math.abs(optimal.pool.currentAPY - (current.pool and current.pool.currentAPY or 0))
        maxYieldDifference = math.max(maxYieldDifference, yieldDifference)
    end
    
    if maxYieldDifference >= strategy.rebalanceThreshold then
        return true, REBALANCE_TRIGGERS.YIELD_THRESHOLD
    end
    
    return false, "No rebalancing needed"
end

-- Get current user allocations (placeholder - would integrate with actual vault state)
function StrategyEngine.getCurrentAllocations(userAddress)
    -- This would integrate with the actual vault state to get current allocations
    -- For now, return empty allocations
    return {}
end

-- Execute rebalancing for user
function StrategyEngine.executeRebalance(userAddress, trigger)
    local state = StrategyEngine.getState()
    
    if state.isRebalancing then
        return false, "Rebalancing already in progress"
    end
    
    state.isRebalancing = true
    
    local success, result = pcall(function()
        local strategy = StrategyEngine.getUserStrategy(userAddress)
        if not strategy then
            error("No strategy found for user")
        end
        
        -- Get user's current vault balance
        local userShares = _G.State.userShares[userAddress] or 0
        local userValue = 0
        
        if _G.State.totalShares > 0 then
            userValue = (userShares * _G.State.totalAssets) / _G.State.totalShares
        end
        
        if userValue <= 0 then
            error("No assets to rebalance")
        end
        
        -- Calculate optimal allocation
        local optimalAllocations = StrategyEngine.calculateOptimalAllocation(userAddress, userValue)
        
        -- Execute rebalancing (this would involve actual token transfers)
        local rebalanceResult = StrategyEngine.executeAllocationChanges(userAddress, optimalAllocations)
        
        -- Update strategy state
        strategy.lastRebalance = Utils.getCurrentTimestamp()
        state.totalRebalances = state.totalRebalances + 1
        
        -- Record rebalance history
        table.insert(state.rebalanceHistory, {
            userAddress = userAddress,
            timestamp = Utils.getCurrentTimestamp(),
            trigger = trigger,
            allocations = optimalAllocations,
            success = true
        })
        
        Utils.log("Rebalancing completed for user " .. userAddress .. " (trigger: " .. trigger .. ")")
        return rebalanceResult
    end)
    
    state.isRebalancing = false
    
    if not success then
        state.failedRebalances = state.failedRebalances + 1
        Utils.log("Rebalancing failed for user " .. userAddress .. ": " .. tostring(result), "ERROR")
        return false, result
    end
    
    return true, result
end

-- Execute allocation changes (placeholder for actual implementation)
function StrategyEngine.executeAllocationChanges(userAddress, allocations)
    -- This would involve:
    -- 1. Withdrawing from current positions
    -- 2. Swapping tokens if needed
    -- 3. Depositing into new positions
    -- 4. Updating vault state
    
    Utils.log("Executing allocation changes for user " .. userAddress)
    
    local changes = {}
    for poolId, allocation in pairs(allocations) do
        table.insert(changes, {
            poolId = poolId,
            amount = allocation.allocation,
            apy = allocation.pool.currentAPY
        })
    end
    
    return {
        success = true,
        changes = changes,
        timestamp = Utils.getCurrentTimestamp()
    }
end

-- Get strategy statistics
function StrategyEngine.getStats()
    local state = StrategyEngine.getState()
    
    local activeStrategiesCount = 0
    local strategyTypes = {}
    
    for _, strategy in pairs(state.activeStrategies) do
        if strategy.isActive then
            activeStrategiesCount = activeStrategiesCount + 1
            strategyTypes[strategy.type] = (strategyTypes[strategy.type] or 0) + 1
        end
    end
    
    return {
        activeStrategies = activeStrategiesCount,
        strategyTypes = strategyTypes,
        totalRebalances = state.totalRebalances,
        failedRebalances = state.failedRebalances,
        successRate = state.totalRebalances > 0 and ((state.totalRebalances - state.failedRebalances) / state.totalRebalances) or 0,
        lastRebalance = state.lastRebalance,
        isRebalancing = state.isRebalancing
    }
end

return StrategyEngine
