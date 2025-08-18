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

-- External service settings
Config.EXTERNAL_SERVICES = {
    ASTRO_USD_PROCESS = "", -- AstroUSD process ID (to be set)
    APUS_AI_ENDPOINT = "", -- Apus Network AI service endpoint
    RANDAO_PROCESS = "", -- RandAO process ID
    ARDRIVE_PROCESS = "", -- ArDrive process ID for storage
    
    -- Timeouts (milliseconds)
    DEFAULT_TIMEOUT = 30000,
    AI_PREDICTION_TIMEOUT = 60000,
    STORAGE_TIMEOUT = 45000
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

-- Logging configuration
Config.LOGGING = {
    LEVEL = "INFO", -- DEBUG, INFO, WARN, ERROR
    MAX_LOG_SIZE = 1000, -- Maximum number of log entries to keep
    ENABLE_PERMANENT_LOGGING = true -- Log to Arweave via ArDrive
}

-- Development settings
Config.DEV = {
    ENABLE_TEST_MODE = false, -- Enable test mode features
    MOCK_EXTERNAL_SERVICES = false, -- Mock external service calls
    FAST_REBALANCING = false, -- Reduce rebalancing intervals for testing
    DEBUG_MESSAGES = false -- Enable debug message logging
}

-- Network settings
Config.NETWORK = {
    MAINNET = {
        GATEWAY_URL = "https://arweave.net",
        CU_URL = "https://cu.ao-testnet.xyz",
        MU_URL = "https://mu.ao-testnet.xyz"
    },
    TESTNET = {
        GATEWAY_URL = "https://arweave.net",
        CU_URL = "https://cu.ao-testnet.xyz", 
        MU_URL = "https://mu.ao-testnet.xyz"
    }
}

-- Validation functions
function Config.validateUserConfig(userConfig)
    local errors = {}
    
    if userConfig.riskTolerance and not Config.RISK_LEVELS[userConfig.riskTolerance] then
        table.insert(errors, "Invalid risk tolerance level")
    end
    
    if userConfig.minYieldThreshold then
        local threshold = tonumber(userConfig.minYieldThreshold)
        if not threshold or threshold < 0 or threshold > 100 then
            table.insert(errors, "Invalid minimum yield threshold")
        end
    end
    
    if userConfig.maxAllocation then
        local allocation = tonumber(userConfig.maxAllocation)
        if not allocation or allocation <= 0 or allocation > 100 then
            table.insert(errors, "Invalid maximum allocation percentage")
        end
    end
    
    return #errors == 0, errors
end

-- Get configuration for user's risk level
function Config.getRiskConfig(riskTolerance)
    return Config.RISK_LEVELS[riskTolerance] or Config.RISK_LEVELS.medium
end

-- Environment detection
function Config.isTestnet()
    -- This would be determined by process environment or tags
    return true -- Default to testnet for development
end

function Config.getCurrentNetworkConfig()
    return Config.isTestnet() and Config.NETWORK.TESTNET or Config.NETWORK.MAINNET
end

return Config