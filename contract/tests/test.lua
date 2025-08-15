-- Test suite for YAO Optimizer Vault Process

local json = require('json')

-- Test utilities
local function assert_equal(actual, expected, message)
    if actual ~= expected then
        error(message .. " - Expected: " .. tostring(expected) .. ", Got: " .. tostring(actual))
    end
    print("✓ " .. (message or "Test passed"))
end

local function assert_not_nil(value, message)
    if value == nil then
        error(message .. " - Value should not be nil")
    end
    print("✓ " .. (message or "Value exists"))
end

-- Test state initialization
local function test_state_initialization()
    print("\n=== Testing State Initialization ===")
    
    assert_not_nil(State, "State should be initialized")
    assert_equal(State.totalShares, 0, "Initial total shares should be 0")
    assert_equal(State.totalAssets, 0, "Initial total assets should be 0")
    assert_equal(State.emergencyMode, false, "Emergency mode should be false initially")
    assert_equal(State.version, "0.1.0", "Version should be set")
    
    print("State initialization tests passed!")
end

-- Test deposit functionality
local function test_deposit()
    print("\n=== Testing Deposit Functionality ===")
    
    -- Reset state for clean test
    State.totalShares = 0
    State.totalAssets = 0
    State.userShares = {}
    
    -- Simulate deposit message
    local testMsg = {
        From = "test-user-1",
        Tags = {
            Amount = "1000"
        }
    }
    
    -- Mock ao.send to capture responses
    local responses = {}
    _G.ao = _G.ao or {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Execute deposit handler
    ProcessHandlers.depositHandler(testMsg)
    
    -- Verify state changes
    assert_equal(State.totalShares, 1000, "Total shares should equal deposit amount for first deposit")
    assert_equal(State.totalAssets, 1000, "Total assets should equal deposit amount")
    assert_equal(State.userShares["test-user-1"], 1000, "User shares should be recorded")
    
    -- Verify response
    assert_equal(#responses, 1, "Should send one response")
    assert_equal(responses[1].Action, "Deposit-Success", "Should send success response")
    
    print("Deposit functionality tests passed!")
end

-- Test withdrawal functionality
local function test_withdraw()
    print("\n=== Testing Withdrawal Functionality ===")
    
    -- Setup initial state with existing deposit
    State.totalShares = 1000
    State.totalAssets = 1000
    State.userShares = {["test-user-1"] = 1000}
    
    local testMsg = {
        From = "test-user-1",
        Tags = {
            Shares = "500"
        }
    }
    
    local responses = {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Execute withdrawal handler
    ProcessHandlers.withdrawHandler(testMsg)
    
    -- Verify state changes
    assert_equal(State.totalShares, 500, "Total shares should be reduced")
    assert_equal(State.totalAssets, 500, "Total assets should be reduced")
    assert_equal(State.userShares["test-user-1"], 500, "User shares should be reduced")
    
    -- Verify response
    assert_equal(#responses, 1, "Should send one response")
    assert_equal(responses[1].Action, "Withdraw-Success", "Should send success response")
    
    print("Withdrawal functionality tests passed!")
end

-- Test configuration functionality
local function test_configuration()
    print("\n=== Testing Configuration Functionality ===")
    
    local testMsg = {
        From = "test-user-1",
        Tags = {
            RiskTolerance = "high",
            MinYield = "7.5",
            MaxAllocation = "40.0",
            AutoCompound = "true",
            ApprovalRequired = "false"
        }
    }
    
    local responses = {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Execute configuration handler
    ProcessHandlers.configureHandler(testMsg)
    
    -- Verify configuration stored
    local config = State.userConfigs["test-user-1"]
    assert_not_nil(config, "User configuration should be stored")
    assert_equal(config.riskTolerance, "high", "Risk tolerance should be set")
    assert_equal(config.minYieldThreshold, 7.5, "Min yield threshold should be set")
    assert_equal(config.autoCompound, true, "Auto compound should be enabled")
    
    -- Verify response
    assert_equal(#responses, 1, "Should send one response")
    assert_equal(responses[1].Action, "Configure-Success", "Should send success response")
    
    print("Configuration functionality tests passed!")
end

-- Test query functionality
local function test_query()
    print("\n=== Testing Query Functionality ===")
    
    -- Setup state with user data
    State.totalShares = 2000
    State.totalAssets = 2100  -- Some yield earned
    State.userShares = {["test-user-1"] = 1000}
    
    local testMsg = {
        From = "test-user-1"
    }
    
    local responses = {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Execute query handler
    ProcessHandlers.queryHandler(testMsg)
    
    -- Verify response
    assert_equal(#responses, 1, "Should send one response")
    assert_equal(responses[1].Action, "Query-Response", "Should send query response")
    
    -- Parse response data
    local responseData = json.decode(responses[1].Data)
    assert_equal(responseData.shares, 1000, "Should return correct share count")
    assert_equal(responseData.value, 1050, "Should return correct value (proportional to yield)")
    
    print("Query functionality tests passed!")
end

-- Test error handling
local function test_error_handling()
    print("\n=== Testing Error Handling ===")
    
    local responses = {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Test invalid deposit amount
    local invalidDepositMsg = {
        From = "test-user-1",
        Tags = {
            Amount = "invalid"
        }
    }
    
    ProcessHandlers.depositHandler(invalidDepositMsg)
    assert_equal(responses[#responses].Action, "Deposit-Error", "Should handle invalid deposit amount")
    
    -- Test insufficient shares for withdrawal
    State.userShares = {["test-user-1"] = 100}
    local invalidWithdrawMsg = {
        From = "test-user-1",
        Tags = {
            Shares = "200"
        }
    }
    
    ProcessHandlers.withdrawHandler(invalidWithdrawMsg)
    assert_equal(responses[#responses].Action, "Withdraw-Error", "Should handle insufficient shares")
    
    print("Error handling tests passed!")
end

-- Test yield monitoring initialization
local function test_yield_monitor_init()
    print("\n=== Testing Yield Monitor Initialization ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    
    -- Initialize yield monitor
    YieldMonitor.init()
    
    local state = YieldMonitor.getState()
    assert_not_nil(state, "Yield monitor state should be initialized")
    assert_not_nil(state.pools, "Pools table should exist")
    assert_not_nil(state.knownPools, "Known pools list should exist")
    assert_equal(state.isScanning, false, "Should not be scanning initially")
    assert_equal(state.scanErrors, 0, "Should have no scan errors initially")
    
    print("Yield monitor initialization tests passed!")
end

-- Test pool data validation
local function test_pool_data_validation()
    print("\n=== Testing Pool Data Validation ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    
    -- Test valid pool data
    local validPoolData = {
        id = "test-pool-1",
        name = "Test Pool",
        currentAPY = 10.5,
        tvl = 50000,
        riskScore = 5,
        supportedTokens = {"AstroUSD"}
    }
    
    local isValid, errors = YieldMonitor.validatePoolData(validPoolData)
    assert_equal(isValid, true, "Valid pool data should pass validation")
    assert_equal(#errors, 0, "Should have no validation errors")
    
    -- Test invalid pool data
    local invalidPoolData = {
        id = "", -- Invalid empty ID
        currentAPY = 1500, -- Invalid APY > 1000%
        tvl = -1000, -- Invalid negative TVL
        riskScore = 15 -- Invalid risk score > 10
    }
    
    isValid, errors = YieldMonitor.validatePoolData(invalidPoolData)
    assert_equal(isValid, false, "Invalid pool data should fail validation")
    assert_equal(#errors > 0, true, "Should have validation errors")
    
    print("Pool data validation tests passed!")
end

-- Test pool info management
local function test_pool_info_management()
    print("\n=== Testing Pool Info Management ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    YieldMonitor.init()
    
    -- Test updating pool info
    local poolData = {
        id = "test-pool-1",
        name = "Test Pool",
        currentAPY = 12.5,
        tvl = 75000,
        riskScore = 3,
        supportedTokens = {"AstroUSD", "AR"}
    }
    
    local updatedPool = YieldMonitor.updatePoolInfo("test-pool-1", poolData)
    assert_not_nil(updatedPool, "Should return updated pool info")
    assert_equal(updatedPool.name, "Test Pool", "Pool name should be updated")
    assert_equal(updatedPool.currentAPY, 12.5, "Pool APY should be updated")
    assert_equal(updatedPool.healthStatus, "healthy", "Pool should be healthy")
    
    -- Test retrieving pool info
    local retrievedPool = YieldMonitor.getPoolInfo("test-pool-1")
    assert_not_nil(retrievedPool, "Should retrieve pool info")
    assert_equal(retrievedPool.id, "test-pool-1", "Should have correct pool ID")
    
    -- Test historical APY tracking
    YieldMonitor.updatePoolInfo("test-pool-1", {currentAPY = 13.0})
    YieldMonitor.updatePoolInfo("test-pool-1", {currentAPY = 11.8})
    
    local poolWithHistory = YieldMonitor.getPoolInfo("test-pool-1")
    assert_equal(#poolWithHistory.historicalAPY >= 2, true, "Should track historical APY data")
    
    print("Pool info management tests passed!")
end

-- Test yield scanning functionality
local function test_yield_scanning()
    print("\n=== Testing Yield Scanning ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    YieldMonitor.init()
    
    -- Test yield scanning
    local scanResult = YieldMonitor.scanYields()
    assert_not_nil(scanResult, "Scan should return result")
    assert_not_nil(scanResult.success, "Should report success count")
    assert_not_nil(scanResult.errors, "Should report error count")
    assert_not_nil(scanResult.timestamp, "Should include timestamp")
    
    -- Verify pools were updated
    local allPools = YieldMonitor.getAllPools()
    local poolCount = 0
    for _ in pairs(allPools) do
        poolCount = poolCount + 1
    end
    assert_equal(poolCount > 0, true, "Should have scanned and stored pool data")
    
    -- Test scan prevention when already scanning
    local state = YieldMonitor.getState()
    state.isScanning = true
    local preventedScan = YieldMonitor.scanYields()
    assert_equal(preventedScan, false, "Should prevent concurrent scans")
    
    print("Yield scanning tests passed!")
end

-- Test pool health monitoring
local function test_pool_health_monitoring()
    print("\n=== Testing Pool Health Monitoring ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    YieldMonitor.init()
    
    -- Create a test pool
    YieldMonitor.updatePoolInfo("health-test-pool", {
        id = "health-test-pool",
        name = "Health Test Pool",
        currentAPY = 10.0,
        tvl = 50000,
        riskScore = 5
    })
    
    local pool = YieldMonitor.getPoolInfo("health-test-pool")
    assert_equal(pool.healthStatus, "healthy", "New pool should be healthy")
    
    -- Test error recording
    YieldMonitor.recordPoolError("health-test-pool", "Test error")
    pool = YieldMonitor.getPoolInfo("health-test-pool")
    assert_equal(pool.errorCount, 1, "Should record error count")
    assert_not_nil(pool.lastError, "Should store last error")
    
    -- Test critical health status after multiple errors
    YieldMonitor.recordPoolError("health-test-pool", "Error 2")
    YieldMonitor.recordPoolError("health-test-pool", "Error 3")
    pool = YieldMonitor.getPoolInfo("health-test-pool")
    assert_equal(pool.healthStatus, "critical", "Should be critical after multiple errors")
    
    -- Test healthy pools filtering
    YieldMonitor.updatePoolInfo("healthy-pool", {
        id = "healthy-pool",
        currentAPY = 8.0,
        tvl = 30000,
        riskScore = 2
    })
    
    local healthyPools = YieldMonitor.getHealthyPools()
    assert_not_nil(healthyPools["healthy-pool"], "Should include healthy pool")
    assert_equal(healthyPools["health-test-pool"], nil, "Should exclude critical pool")
    
    print("Pool health monitoring tests passed!")
end

-- Test yield monitoring statistics
local function test_yield_stats()
    print("\n=== Testing Yield Statistics ===")
    
    local YieldMonitor = require('modules.yield-monitor')
    YieldMonitor.init()
    
    -- Add some test pools
    YieldMonitor.updatePoolInfo("stats-pool-1", {
        currentAPY = 10.0,
        tvl = 50000,
        riskScore = 3
    })
    
    YieldMonitor.updatePoolInfo("stats-pool-2", {
        currentAPY = 15.0,
        tvl = 30000,
        riskScore = 6
    })
    
    local stats = YieldMonitor.getStats()
    assert_not_nil(stats, "Should return statistics")
    assert_equal(stats.totalPools >= 2, true, "Should count pools")
    assert_equal(stats.averageAPY > 0, true, "Should calculate average APY")
    assert_equal(stats.totalTVL > 0, true, "Should sum total TVL")
    assert_not_nil(stats.healthyPools, "Should count healthy pools")
    
    print("Yield statistics tests passed!")
end

-- Test yield monitoring message handlers
local function test_yield_message_handlers()
    print("\n=== Testing Yield Monitoring Message Handlers ===")
    
    local responses = {}
    ao.send = function(msg)
        table.insert(responses, msg)
    end
    
    -- Test scan yields handler
    local scanMsg = {
        From = "test-user-1",
        Tags = {
            Action = "Scan-Yields"
        }
    }
    
    ProcessHandlers.scanYieldsHandler(scanMsg)
    assert_equal(responses[#responses].Action, "Scan-Yields-Response", "Should respond to scan yields")
    
    -- Test pool data update handler
    local updateMsg = {
        From = "test-user-1",
        Tags = {
            Action = "Update-Pool",
            PoolId = "test-update-pool",
            Name = "Test Update Pool",
            APY = "8.5",
            TVL = "25000",
            RiskScore = "4",
            IsActive = "true"
        }
    }
    
    ProcessHandlers.updatePoolDataHandler(updateMsg)
    assert_equal(responses[#responses].Action, "Update-Pool-Success", "Should respond to pool update")
    
    -- Test pool health handler
    local healthMsg = {
        From = "test-user-1",
        Tags = {
            Action = "Pool-Health"
        }
    }
    
    ProcessHandlers.poolHealthHandler(healthMsg)
    assert_equal(responses[#responses].Action, "Pool-Health-Response", "Should respond to health check")
    
    -- Test yield stats handler
    local statsMsg = {
        From = "test-user-1",
        Tags = {
            Action = "Yield-Stats"
        }
    }
    
    ProcessHandlers.yieldStatsHandler(statsMsg)
    assert_equal(responses[#responses].Action, "Yield-Stats-Response", "Should respond to stats request")
    
    print("Yield monitoring message handlers tests passed!")
end

-- Run all tests
local function run_tests()
    print("Starting YAO Optimizer Vault Tests...")
    
    -- Core vault functionality tests
    test_state_initialization()
    test_deposit()
    test_withdraw()
    test_configuration()
    test_query()
    test_error_handling()
    
    -- Yield monitoring tests
    test_yield_monitor_init()
    test_pool_data_validation()
    test_pool_info_management()
    test_yield_scanning()
    test_pool_health_monitoring()
    test_yield_stats()
    test_yield_message_handlers()
    
    print("\n🎉 All tests passed! Vault process with yield monitoring is ready for deployment.")
end

-- Execute tests
run_tests()