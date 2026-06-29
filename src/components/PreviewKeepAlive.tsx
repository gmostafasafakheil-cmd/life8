"use client";

import { useEffect } from "react";

export default function PreviewKeepAlive() {
  useEffect(() => {
    // Light keep-alive ping
    const ping = () => {
      fetch("/api/health", { cache: "no-store" }).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 60_000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
