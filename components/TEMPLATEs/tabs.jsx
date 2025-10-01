"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg bg-black p-1 text-gray-400 border border-amber-500 w-full min-w-0",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 hover:text-amber-500 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-amber-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 flex-1",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 outline-offset-2 focus-visible:outline-2 focus-visible:outline-amber-500",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
