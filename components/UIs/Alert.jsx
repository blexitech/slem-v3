"use client";

import React from "react";

const Alert = ({
  type = "warning",
  title,
  message,
  note,
  icon,
  className = "",
}) => {
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "warning":
        return (
          <svg
            className="w-16 h-16 mx-auto text-amber-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-16 h-16 mx-auto text-blue-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "success":
        return (
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "warning":
        return "border-amber-500";
      case "error":
        return "border-red-500";
      case "info":
        return "border-blue-500";
      case "success":
        return "border-green-500";
      default:
        return "border-amber-500";
    }
  };

  const getNoteBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
      case "info":
        return "bg-blue-500/10 border-blue-500/20";
      case "success":
        return "bg-green-500/10 border-green-500/20";
      default:
        return "bg-amber-500/10 border-amber-500/20";
    }
  };

  const getNoteTextColor = () => {
    switch (type) {
      case "warning":
        return "text-amber-400";
      case "error":
        return "text-red-400";
      case "info":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      default:
        return "text-amber-400";
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center min-h-screen bg-black ${className}`}
    >
      <div
        className={`text-center p-8 bg-black rounded-lg border ${getBorderColor()} max-w-md mx-4`}
      >
        <div className="mb-4">{getIcon()}</div>
        {title && (
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        )}
        {message && <p className="text-gray-300 mb-6">{message}</p>}
        {note && (
          <div className={`${getNoteBgColor()} border rounded-lg p-4`}>
            <p className={`${getNoteTextColor()} text-sm`}>
              <strong>Note:</strong> {note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
