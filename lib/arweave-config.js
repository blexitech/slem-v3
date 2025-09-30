// Arweave Configuration
export const arweaveConfig = {
  // Arweave Gateway
  gateway: process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY || "arweave.net",

  // Protocol
  protocol: process.env.NEXT_PUBLIC_ARWEAVE_PROTOCOL || "https",

  // Port
  port: process.env.NEXT_PUBLIC_ARWEAVE_PORT || 443,

  // Timeout
  timeout: 20000,

  // Logging
  logging: false,

  // App Configuration
  appName: process.env.NEXT_PUBLIC_ARWEAVE_APP_NAME || "SLE-Marketplace",
  appVersion: process.env.NEXT_PUBLIC_ARWEAVE_APP_VERSION || "3.0.0",

  // Content Types
  contentType: "application/json",

  // Default tags for transactions
  defaultTags: {
    "Content-Type": "application/json",
    "App-Name": process.env.NEXT_PUBLIC_ARWEAVE_APP_NAME || "SLE-Marketplace",
    "App-Version": process.env.NEXT_PUBLIC_ARWEAVE_APP_VERSION || "3.0.0",
  },
};

// Helper function to get Arweave instance configuration
export const getArweaveConfig = () => ({
  host: arweaveConfig.gateway,
  port: arweaveConfig.port,
  protocol: arweaveConfig.protocol,
  timeout: arweaveConfig.timeout,
  logging: arweaveConfig.logging,
});
