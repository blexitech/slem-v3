"use client";

import React, { useState } from "react";

const DebugPinataPage = () => {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  const testConfig = () => {
    try {
      // Test environment variables
      const envVars = {
        PINATA_JWT:
          process.env.NEXT_PUBLIC_PINATA_JWT ||
          process.env.NEXT_PUBLIC_PINATA_JWT_KEY
            ? "✅ Set"
            : "❌ Missing",
        PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY
          ? "✅ Set"
          : "❌ Missing",
        PINATA_SECRET_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
          ? "✅ Set"
          : "❌ Missing",
        PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY
          ? "✅ Set"
          : "❌ Missing",
      };

      setConfig(envVars);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full bg-black text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-yellow-400">
          Pinata Configuration Debug
        </h1>

        <div className="mb-8 p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Environment Variables Check
          </h2>
          <button
            onClick={testConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
          >
            Check Configuration
          </button>

          {config && (
            <div className="space-y-2">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-300">{key}:</span>
                  <span
                    className={
                      value.includes("✅") ? "text-green-400" : "text-red-400"
                    }
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-900 border border-gray-600 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Required Environment Variables
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <strong>Option 1 (Recommended):</strong> Use JWT token
            </p>
            <code className="block bg-gray-800 p-2 rounded text-green-400">
              NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here
            </code>
            <code className="block bg-gray-800 p-2 rounded text-green-400">
              NEXT_PUBLIC_PINATA_GATEWAY=your_gateway_domain.mypinata.cloud
            </code>

            <p className="text-gray-300 mt-4">
              <strong>Option 2:</strong> Use API Key + Secret
            </p>
            <code className="block bg-gray-800 p-2 rounded text-green-400">
              NEXT_PUBLIC_PINATA_API_KEY=your_api_key_here
            </code>
            <code className="block bg-gray-800 p-2 rounded text-green-400">
              NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_key_here
            </code>
            <code className="block bg-gray-800 p-2 rounded text-green-400">
              NEXT_PUBLIC_PINATA_GATEWAY=your_gateway_domain.mypinata.cloud
            </code>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-500 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            How to Get Your Credentials
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>
              Go to{" "}
              <a
                href="https://app.pinata.cloud/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Pinata Keys Page
              </a>
            </li>
            <li>Click "New Key" button</li>
            <li>Select "Admin" privileges (for testing)</li>
            <li>Give it a name and click "Create Key"</li>
            <li>
              Copy the <strong>JWT</strong> token (recommended) or API Key +
              Secret
            </li>
            <li>
              Go to{" "}
              <a
                href="https://app.pinata.cloud/gateways"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Gateways Page
              </a>
            </li>
            <li>
              Copy your gateway domain (e.g.,
              "aquamarine-casual-tarantula-177.mypinata.cloud")
            </li>
            <li>
              Add these to your{" "}
              <code className="bg-gray-800 px-1 rounded">.env.local</code> file
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugPinataPage;
