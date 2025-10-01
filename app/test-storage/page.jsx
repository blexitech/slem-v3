"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePinataNFTStorage } from "../../lib/usePinataNFTStorage";

const TestStoragePage = () => {
  const { address, isConnected } = useAppKitAccount();
  const { createOrUpdateProfile, getProfile, uploadNFT, loading, error } =
    usePinataNFTStorage();

  const [testData, setTestData] = useState({
    fullName: "Test User",
    username: "testuser",
    email: "test@example.com",
    dateOfBirth: "1990-01-01",
  });

  const [nftMetadata, setNftMetadata] = useState({
    name: "Test NFT",
    description: "A test NFT for the new system",
    image: "https://example.com/image.png",
    attributes: [
      { trait_type: "Color", value: "Blue" },
      { trait_type: "Rarity", value: "Common" },
    ],
  });

  const [results, setResults] = useState([]);

  const addResult = (message, type = "info") => {
    setResults((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toISOString() },
    ]);
  };

  const testProfileUpload = async () => {
    if (!isConnected || !address) {
      addResult("❌ Please connect your wallet first", "error");
      return;
    }

    try {
      addResult("🚀 Testing profile upload to Pinata...", "info");

      const userData = {
        ...testData,
        metadata: {
          version: "3.0",
          storage: "pinata",
          testMode: true,
        },
      };

      const result = await createOrUpdateProfile(userData, address);

      if (result.success) {
        addResult(
          `✅ Profile uploaded successfully! CID: ${result.cid}`,
          "success"
        );
      } else {
        addResult(`❌ Profile upload failed: ${result.error}`, "error");
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, "error");
    }
  };

  const testProfileRetrieval = async () => {
    if (!isConnected || !address) {
      addResult("❌ Please connect your wallet first", "error");
      return;
    }

    try {
      addResult("🔍 Testing profile retrieval from Pinata...", "info");

      const result = await getProfile(address);

      if (result.success) {
        addResult("✅ Profile retrieved successfully!", "success");
        addResult(
          `📦 Data: ${JSON.stringify(result.data.sensitiveData.data, null, 2)}`,
          "info"
        );
      } else {
        addResult(`❌ Profile retrieval failed: ${result.error}`, "error");
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, "error");
    }
  };

  const testNFTUpload = async () => {
    if (!isConnected || !address) {
      addResult("❌ Please connect your wallet first", "error");
      return;
    }

    try {
      addResult("🚀 Testing NFT metadata upload to NFT.Storage...", "info");

      const mintAddress = `test-mint-${Date.now()}`;
      const result = await uploadNFT(nftMetadata, mintAddress, address);

      if (result.success) {
        addResult(
          `✅ NFT metadata uploaded successfully! CID: ${result.cid}`,
          "success"
        );
      } else {
        addResult(`❌ NFT metadata upload failed: ${result.error}`, "error");
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, "error");
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!isConnected) {
    return (
      <div className="w-full bg-black text-white min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-yellow-400">
            Storage System Test (Pinata + NFT.Storage)
          </h1>
          <div className="bg-black border border-amber-400 p-6 rounded-lg">
            <p className="text-center text-gray-400">
              Please connect your wallet to test the Pinata + NFT.Storage
              integration
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-yellow-400">
          Storage System Test (Pinata + NFT.Storage)
        </h1>

        {/* Test Data */}
        <div className="mb-8 p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Test Data
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={testData.fullName}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={testData.username}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={testData.email}
                onChange={(e) =>
                  setTestData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              />
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mb-8 p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Test Controls
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testProfileUpload}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test Profile Upload (Pinata)
            </button>
            <button
              onClick={testProfileRetrieval}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Profile Retrieval (Pinata)
            </button>
            <button
              onClick={testNFTUpload}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Test NFT Upload (NFT.Storage)
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Test Results
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No test results yet. Run a test to see results.
              </p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md text-sm ${
                    result.type === "success"
                      ? "bg-green-900/20 border border-green-500 text-green-400"
                      : result.type === "error"
                        ? "bg-red-900/20 border border-red-500 text-red-400"
                        : "bg-blue-900/20 border border-blue-500 text-blue-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{result.message}</span>
                    <span className="text-xs opacity-70 ml-2">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-300">Storage:</span>
              <span className="text-green-400 ml-2">Pinata + NFT.Storage</span>
            </div>
            <div>
              <span className="font-medium text-gray-300">Version:</span>
              <span className="text-blue-400 ml-2">3.0</span>
            </div>
            <div>
              <span className="font-medium text-gray-300">Wallet:</span>
              <span className="text-yellow-400 ml-2">
                {address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : "Not connected"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-300">Status:</span>
              <span className="text-green-400 ml-2">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStoragePage;
