export const config = {
  // AO Network Configuration
  aoProcessId: "ZZkO9BJvOiDnhhlSfYOHezk1czIboXQVb8oI3NSlai8", // TODO: Replace with your AO process ID

  // APUS HyperBEAM Node Configuration
  apusHyperbeamNodeUrl: "http://72.46.85.207:8734",

  // App Configuration
  appName: "Yao",
  appLogo: "https://arweave.net/tQUcL4wlNj_NED2VjUGUhfCTJ6pDN9P0e3CbnHo3vUE",

  // Attestation Configuration
  defaultAttestedBy: ["NVIDIA", "AMD"],

  // UI Configuration
  theme: {
    accent: { r: 9, g: 29, b: 255 },
  },

  // Wallet Configuration
  walletPermissions: [
    "ACCESS_ADDRESS",
    "SIGN_TRANSACTION",
    "DISPATCH",
  ] as const,
  ensurePermissions: true,
} as const;
