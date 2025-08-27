-- Configuration for YAO Optimizer Vault

local Config = {}
-- 2XDgNa1PfFAHZS5Y6qJojT9_nJKaEhfhTKcui8jw-2U
-- Vault settings
Config.VAULT = {
    NAME = "YAO Optimizer",
    VERSION = "0.1.0",
    MIN_DEPOSIT = 1, -- Minimum deposit amount
    MIN_WITHDRAWAL = 1, -- Minimum withdrawal amount
    MAX_USERS = 10000, -- Maximum number of users
    EMERGENCY_COOLDOWN = 3600, -- Emergency mode cooldown in seconds
    TOKEN_ID = "Iu_h9OT9RDa8yd-UGG-fONU1kn5Jj-DcUMMfyGNrKps" -- Accepted token ID
}

-- Default user configuration
Config.DEFAULT_USER_CONFIG = {
    riskTolerance = "medium",
    minYieldThreshold = 5.0, -- Minimum APY percentage
    maxAllocation = 50.0, -- Maximum allocation to single pool (%)
    autoCompound = true,
    approvalRequired = false -- Require approval for high-value operations
}

-- Risk tolerance settings
Config.RISK_LEVELS = {
    low = {
        maxPoolAllocation = 25.0, -- Max % in single pool
        minPoolDiversification = 4, -- Minimum number of pools
        maxVolatilityScore = 3.0, -- Max volatility score (1-10)
        emergencyThreshold = 5.0 -- % loss to trigger emergency mode
    },
    medium = {
        maxPoolAllocation = 50.0,
        minPoolDiversification = 3,
        maxVolatilityScore = 6.0,
        emergencyThreshold = 10.0
    },
    high = {
        maxPoolAllocation = 75.0,
        minPoolDiversification = 2,
        maxVolatilityScore = 10.0,
        emergencyThreshold = 20.0
    }
}

-- Yield monitoring settings
Config.YIELD_MONITOR = {
    SCAN_INTERVAL = 300, -- Scan every 5 minutes (seconds)
    MIN_APY_DIFFERENCE = 1.0, -- Minimum APY difference to trigger rebalance (%)
    POOL_HEALTH_THRESHOLD = 7.0, -- Minimum pool health score (1-10)
    MAX_POOLS_TO_MONITOR = 50 -- Maximum number of pools to track
}

-- Rebalancing settings
Config.REBALANCING = {
    MIN_REBALANCE_AMOUNT = 100, -- Minimum amount to trigger rebalance
    MAX_REBALANCE_FREQUENCY = 3600, -- Max once per hour (seconds)
    SLIPPAGE_TOLERANCE = 2.0, -- Maximum slippage tolerance (%)
    GAS_BUFFER = 1.2 -- Gas estimation buffer multiplier
}

-- Pool configuration
Config.SUPPORTED_POOLS = {
    -- Example pool configurations (to be populated with actual pool data)
    -- {
    --     id = "pool-process-id",
    --     name = "Botega Pool",
    --     supportedTokens = {"AstroUSD"},
    --     riskScore = 5.0,
    --     minDeposit = 10,
    --     enabled = true
    -- }
}

-- Get configuration for user's risk level
function Config.getRiskConfig(riskTolerance)
    return Config.RISK_LEVELS[riskTolerance] or Config.RISK_LEVELS.medium
end

return Config