#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createDataItemSigner, message, result as resresult } from '@permaweb/aoconnect';

// const ao = connect();

// Default parameters for Botega AO/GAME from constants.lua
const DEFAULT_CONFIG = {
  dex: "Botega",
  tokenOut: "s6jcB3ctSbiDNwR-paJgy5iOAhahXahLul8exSLHbGE", // GAME_PROCESS_ID
  baseToken: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc", // AO_PROCESS_ID
  poolId: "rG-b4gQwhfjnbmYhrnvCMDPuXguqmAmYwHZf4y24WYs", // BOTEGA_AO_GAME_POOL_ID
  slippage: 1.0,
  conversionPercentage: 50,
  strategyType: "Swap50LP50",
  runIndefinitely: true,
  startDate: Math.floor(Date.now() / 1000), // Current timestamp
  endDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
};
const wallet = JSON.parse(
    readFileSync("./wallet.json").toString(),
  );

async function spawnAgent() {
  try {
    // Get manager process ID from environment or command line args
    const managerProcessId = "CAT2qDMSaOFO1eXsYpKcitU2S-b31nW076_-q814RHM" //process.env.MANAGER_PROCESS_ID || process.argv[2];
    
    if (!managerProcessId) {
      console.error('Error: Please provide a manager process ID via MANAGER_PROCESS_ID environment variable or as a command line argument');
      process.exit(1);
    }
    
    console.log('Spawning agent from manager:', managerProcessId);
    console.log('Using default Botega AO/GAME configuration:');
    console.log('- DEX:', DEFAULT_CONFIG.dex);
    console.log('- Token Out (GAME):', DEFAULT_CONFIG.tokenOut);
    console.log('- Base Token (AO):', DEFAULT_CONFIG.baseToken);
    console.log('- Pool ID:', DEFAULT_CONFIG.poolId);
    console.log('- Slippage:', DEFAULT_CONFIG.slippage + '%');
    console.log('- Conversion Percentage:', DEFAULT_CONFIG.conversionPercentage + '%');
    console.log('- Strategy:', DEFAULT_CONFIG.strategyType);
    console.log('- Run Indefinitely:', DEFAULT_CONFIG.runIndefinitely);
    
    // Send Spawn-Agent message to the manager
    const messageId = await message({
      process: managerProcessId,
      tags: [
        { name: 'Action', value: 'Spawn-Agent' },
        { name: 'Dex', value: DEFAULT_CONFIG.dex },
        { name: 'Token-Out', value: DEFAULT_CONFIG.tokenOut },
        { name: 'Base-Token', value: DEFAULT_CONFIG.baseToken },
        { name: 'Pool-Id', value: DEFAULT_CONFIG.poolId },
        { name: 'Pool-Id-Reference', value: DEFAULT_CONFIG.poolId },
        { name: 'Slippage', value: DEFAULT_CONFIG.slippage.toString() },
        { name: 'Conversion-Percentage', value: DEFAULT_CONFIG.conversionPercentage.toString() },
        { name: 'Strategy-Type', value: DEFAULT_CONFIG.strategyType },
        { name: 'Run-Indefinitely', value: DEFAULT_CONFIG.runIndefinitely.toString() },
        { name: 'Start-Date', value: DEFAULT_CONFIG.startDate.toString() },
        { name: 'End-Date', value: DEFAULT_CONFIG.endDate.toString() }
      ],
      signer: createDataItemSigner(wallet),
    });
    
    console.log('\nSpawn request sent successfully!');
    console.log('Message ID:', messageId);
    
    // Wait for the result
    console.log('\nWaiting for spawn response...');
    const result = await resresult({
      message: messageId,
      process: managerProcessId
    });
    
    console.log('\nSpawn Response:');
    console.log('Action:', result.Messages?.[0]?.Tags?.find(t => t.name === 'Action')?.value);
    console.log('Session ID:', result.Messages?.[0]?.Tags?.find(t => t.name === 'Session-Id')?.value);
    console.log('Data:', result.Messages?.[0]?.Data);
    
    // If successful, the agent process ID will be provided in a separate message
    // You can check the session ID to track the spawning progress
    const sessionId = result.Messages?.[0]?.Tags?.find(t => t.name === 'Session-Id')?.value;
    if (sessionId) {
      console.log('\nAgent spawning initiated. Session ID:', sessionId);
      console.log('The agent process ID will be provided when spawning completes.');
      console.log('You can check the manager logs or query with the session ID to get the final process ID.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

spawnAgent();