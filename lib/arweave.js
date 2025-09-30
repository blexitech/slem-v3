import Arweave from "arweave";
import { getArweaveConfig, arweaveConfig } from "./arweave-config.js";

// Initialize Arweave instance
const arweave = Arweave.init(getArweaveConfig());

// User data schema for Arweave storage (sensitive data only)
export const createUserDataSchema = (userData) => {
  return {
    type: "user-profile-sensitive",
    version: "1.0.0",
    timestamp: Date.now(),
    data: {
      fullName: userData.fullName,
      username: userData.username,
      dateOfBirth: userData.dateOfBirth,
      email: userData.email,
      metadata: {
        createdAt: userData.metadata?.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    },
  };
};

// Upload sensitive user data to Arweave
export const uploadSensitiveUserDataToArweave = async (userData, wallet) => {
  try {
    // Create the data schema
    const userDataSchema = createUserDataSchema(userData);

    // Convert data to buffer
    const dataBuffer = Buffer.from(JSON.stringify(userDataSchema, null, 2));

    // Create transaction
    const transaction = await arweave.createTransaction(
      {
        data: dataBuffer,
      },
      wallet
    );

    // Add tags for better organization
    transaction.addTag("Content-Type", arweaveConfig.contentType);
    transaction.addTag("App-Name", arweaveConfig.appName);
    transaction.addTag("App-Version", arweaveConfig.appVersion);
    transaction.addTag("Type", "user-profile-sensitive");
    transaction.addTag("User-Address", userData.address);

    // Sign the transaction
    await arweave.transactions.sign(transaction, wallet);

    // Submit the transaction
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200) {
      return {
        success: true,
        transactionId: transaction.id,
        arweaveUrl: `https://arweave.net/${transaction.id}`,
        data: userDataSchema,
      };
    } else {
      throw new Error(`Transaction failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Retrieve sensitive user data from Arweave
export const getSensitiveUserDataFromArweave = async (transactionId) => {
  try {
    const transaction = await arweave.transactions.get(transactionId);
    const data = await arweave.transactions.getData(transactionId, {
      decode: true,
      string: true,
    });

    return {
      success: true,
      data: JSON.parse(data),
      transaction: transaction,
    };
  } catch (error) {
    console.error("Error retrieving from Arweave:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Search for user data by address
export const searchUserDataByAddress = async (address) => {
  try {
    const query = {
      op: "and",
      expr1: {
        op: "equals",
        expr1: "App-Name",
        expr2: arweaveConfig.appName,
      },
      expr2: {
        op: "equals",
        expr1: "User-Address",
        expr2: address,
      },
    };

    const results = await arweave.arql(query);

    if (results.length > 0) {
      // Get the most recent transaction
      const latestTransactionId = results[results.length - 1];
      return await getSensitiveUserDataFromArweave(latestTransactionId);
    }

    return {
      success: false,
      error: "No user data found",
    };
  } catch (error) {
    console.error("Error searching Arweave:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate a wallet (for testing purposes)
export const generateWallet = () => {
  return arweave.wallets.generate();
};

// Get wallet balance
export const getWalletBalance = async (address) => {
  try {
    const balance = await arweave.wallets.getBalance(address);
    return arweave.ar.winstonToAr(balance);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return "0";
  }
};
