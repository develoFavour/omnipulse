"use client";

import { Suspense } from "react";
import { BroadcastStudio } from "@/components/broadcast/BroadcastStudio";

export default function BroadcastPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500 font-medium">Loading Broadcast Studio...</div>}>
      <BroadcastStudio />
    </Suspense>
  );
}
