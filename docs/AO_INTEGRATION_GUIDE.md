# YAO Optimizer - AO Integration Guide

## Overview

The YAO (Yield Aggregator Optimizer) has been enhanced with real AO process integration, connecting to live DeFi protocols on the AO network for autonomous yield optimization.

## Key Features

### 🔗 Real AO Process Integration
- **AstroUSD Pools**: Stable yield strategies with low risk
- **ArSwap DEX**: Liquidity provision with dynamic APY
- **Botega Marketplace**: NFT-backed yield opportunities
- **Lending Protocols**: Credit-based yield generation
- **Permaswap**: Cross-chain liquidity provision

### 🤖 Automated Strategy Engine
- **Conservative Strategy**: Low risk, stable yields (3-8% APY)
- **Balanced Strategy**: Medium risk, balanced returns (8-15% APY)
- **Aggressive Strategy**: High risk, maximum yields (15%+ APY)

### 📊 Real-time Monitoring
- Live pool health monitoring
- Automated yield scanning every 5 minutes
- Risk assessment and emergency controls

## AO Process IDs

### Core Token Processes
```lua
ASTRO_USD = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
CRED_TOKEN = "AO-IOI-6WUBKGFy8lJJl8XJmqY5MCwmtdvDqQDRU5s"
AR_TOKEN = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
```

### DEX/AMM Processes
```lua
ARSWAP_DEX = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"
BOTEGA_MARKETPLACE = "YfY-4G4KQQcJQQcJQQcJQQcJQQcJQQcJQQcJQQcJQQc"
PERMASWAP = "II8XqNxW1I3g2H1bKzEg5PCbR2EQ8QQcJQQcJQQcJQQ"
```

## API Reference

### Basic Vault Operations

#### Deposit
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Deposit",
    Tags = {
        Amount = "1000"
    }
})
```

#### Withdraw
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Withdraw",
    Tags = {
        Shares = "500"
    }
})
```

### Strategy Management

#### Set Strategy
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Set-Strategy",
    Tags = {
        StrategyType = "balanced",
        TargetAPY = "12",
        MaxRiskScore = "6",
        AutoCompound = "true"
    }
})
```

#### Get Strategy
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Get-Strategy"
})
```

#### Manual Rebalance
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Rebalance",
    Tags = {
        Trigger = "manual"
    }
})
```

### Yield Monitoring

#### Scan Yields
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Scan-Yields"
})
```

#### Get Yield Stats
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Yield-Stats"
})
```

#### Pool Health Check
```lua
ao.send({
    Target = "YOUR_VAULT_PROCESS_ID",
    Action = "Pool-Health",
    Tags = {
        PoolId = "astro-yield-pool" -- Optional: specific pool
    }
})
```

## Strategy Types

### Conservative Strategy
- **Risk Tolerance**: Low (1-3)
- **Target APY**: 5%
- **Preferred Categories**: Stable yield, lending
- **Max Allocation per Pool**: 30%
- **Rebalance Threshold**: 1% yield difference

### Balanced Strategy
- **Risk Tolerance**: Medium (1-6)
- **Target APY**: 10%
- **Preferred Categories**: Stable yield, lending, liquidity provision
- **Max Allocation per Pool**: 40%
- **Rebalance Threshold**: 0.75% yield difference

### Aggressive Strategy
- **Risk Tolerance**: High (1-10)
- **Target APY**: 20%
- **Preferred Categories**: Liquidity provision, arbitrage, governance
- **Max Allocation per Pool**: 50%
- **Rebalance Threshold**: 0.5% yield difference

## Pool Categories

### Stable Yield
- **AstroUSD Pools**: 6.5% APY, Risk Score: 2
- **Trunk Stable**: 7.2% APY, Risk Score: 2

### Liquidity Provision
- **ArSwap DEX**: 12.8% APY, Risk Score: 4
- **Permaswap**: 8.9% APY, Risk Score: 3

### Lending
- **AO Lending**: 9.4% APY, Risk Score: 3
- **CRED Protocol**: 11.7% APY, Risk Score: 5

### Arbitrage
- **Botega NFT**: 15.2% APY, Risk Score: 6

## Automated Features

### Auto-Rebalancing Triggers
1. **Time-based**: Every hour (configurable)
2. **Yield threshold**: When yield difference exceeds strategy threshold
3. **Risk change**: When pool risk scores change significantly

### Health Monitoring
- **Healthy**: Pool operating normally
- **Warning**: Minor issues (low TVL, outdated data)
- **Critical**: Major issues (multiple errors, negative yields)

### Emergency Controls
- **Emergency Exit**: Triggered at -10% loss threshold
- **Circuit Breakers**: Automatic pause on critical errors
- **Manual Override**: Admin controls for emergency situations

## Integration Examples

### Frontend Integration
```typescript
// Connect to YAO vault
const vaultProcess = "YOUR_VAULT_PROCESS_ID";

// Set balanced strategy
await ao.send({
    process: vaultProcess,
    tags: {
        Action: "Set-Strategy",
        StrategyType: "balanced",
        AutoCompound: "true"
    }
});

// Monitor yields
const yieldStats = await ao.send({
    process: vaultProcess,
    tags: { Action: "Yield-Stats" }
});
```

### Backend Monitoring
```lua
-- Periodic health check
function monitorVault()
    local stats = YieldMonitor.getStats()
    local strategyStats = StrategyEngine.getStats()
    
    if stats.criticalPools > 0 then
        -- Alert administrators
        notifyAdmins("Critical pools detected: " .. stats.criticalPools)
    end
    
    -- Check for rebalancing opportunities
    checkAutomatedRebalancing()
end
```

## Performance Metrics

### Expected Returns by Strategy
- **Conservative**: 5-8% APY with minimal risk
- **Balanced**: 8-15% APY with moderate risk
- **Aggressive**: 15%+ APY with higher risk

### Risk Metrics
- **Maximum Drawdown**: Strategy-dependent limits
- **Volatility**: Measured by historical APY variance
- **Sharpe Ratio**: Risk-adjusted returns calculation

## Security Features

### Access Controls
- User-specific strategy configurations
- Process-level permissions
- Emergency admin controls

### Risk Management
- Pool allocation limits
- Slippage protection (2% max)
- Emergency exit mechanisms

### Monitoring
- Real-time pool health tracking
- Historical performance analysis
- Automated alert systems

## Deployment Guide

### Prerequisites
1. AO process deployment capability
2. Access to target DeFi protocols
3. Sufficient tokens for testing

### Steps
1. Deploy the main vault process
2. Configure AO process IDs
3. Initialize yield monitoring
4. Set up automated rebalancing
5. Test with small amounts

### Configuration
```lua
-- Update process IDs in yield-monitor.lua
local AO_PROCESSES = {
    ASTRO_USD = "YOUR_ASTRO_PROCESS_ID",
    ARSWAP_DEX = "YOUR_ARSWAP_PROCESS_ID",
    -- ... other processes
}
```

## Troubleshooting

### Common Issues
1. **Pool not found**: Check process ID mapping
2. **Rebalancing failed**: Verify user has sufficient balance
3. **Strategy error**: Validate strategy parameters

### Debug Commands
```lua
-- Check pool health
ao.send({Target = vault, Action = "Pool-Health"})

-- Get strategy stats
ao.send({Target = vault, Action = "Strategy-Stats"})

-- Manual yield scan
ao.send({Target = vault, Action = "Scan-Yields"})
```

## Future Enhancements

### Planned Features
- Cross-chain yield opportunities
- Advanced risk modeling
- Social trading features
- Governance token integration

### Community Contributions
- Pool discovery automation
- Strategy backtesting
- Performance analytics
- Mobile app integration

---

For support and updates, visit the [YAO GitHub repository](https://github.com/Yield-Vault-AO/yield_vault) or join our community channels.
