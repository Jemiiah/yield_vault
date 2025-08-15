-- State Management Module for YAO Optimizer

local State = {}

-- Initialize default state structure
function State.init()
    if not _G.State then
        _G.State = {
            totalShares = 0,
            totalAssets = 0,
            userShares = {},
            poolAllocations = {},
            userConfigs = {},
            lastRebalance = 0,
            emergencyMode = false,
            version = "0.1.0",
            processId = ao.id or "unknown"
        }
    end
    return _G.State
end

-- Get current state
function State.get()
    return _G.State or State.init()
end

-- Update user shares
function State.updateUserShares(userAddress, shareAmount)
    local state = State.get()
    state.userShares[userAddress] = shareAmount
end

-- Get user shares
function State.getUserShares(userAddress)
    local state = State.get()
    return state.userShares[userAddress] or 0
end

-- Update total vault metrics
function State.updateTotals(totalShares, totalAssets)
    local state = State.get()
    state.totalShares = totalShares
    state.totalAssets = totalAssets
end

-- Set user configuration
function State.setUserConfig(userAddress, config)
    local state = State.get()
    state.userConfigs[userAddress] = config
end

-- Get user configuration
function State.getUserConfig(userAddress)
    local state = State.get()
    return state.userConfigs[userAddress] or {}
end

-- Emergency mode controls
function State.setEmergencyMode(enabled)
    local state = State.get()
    state.emergencyMode = enabled
end

function State.isEmergencyMode()
    local state = State.get()
    return state.emergencyMode
end

-- Pool allocation management
function State.setPoolAllocation(poolId, amount)
    local state = State.get()
    state.poolAllocations[poolId] = amount
end

function State.getPoolAllocation(poolId)
    local state = State.get()
    return state.poolAllocations[poolId] or 0
end

-- Update last rebalance timestamp
function State.updateLastRebalance()
    local state = State.get()
    state.lastRebalance = os.time()
end

return State