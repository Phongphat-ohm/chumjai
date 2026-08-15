"use client";

export interface QueueBroadcastPayload {
  queueId: string;
  queueNumber: string;
  stationName: string;
  calledAt: number;
}

const CHANNEL_NAME = "chunjai_queue_call_channel";
const STORAGE_KEY = "chunjai_latest_queue_call";

/**
 * Broadcast a queue call event to other tabs (like /queue/display)
 */
export function broadcastQueueCall(payload: QueueBroadcastPayload) {
  if (typeof window === "undefined") return;

  // 1. BroadcastChannel API (Modern Browsers)
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel error:", err);
  }

  // 2. LocalStorage Event (Fallback / Multi-tab sync)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("LocalStorage broadcast error:", err);
  }
}

/**
 * Listen for queue call events in /queue/display
 */
export function listenForQueueCalls(
  onCall: (payload: QueueBroadcastPayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let channel: BroadcastChannel | null = null;

  // 1. Listen via BroadcastChannel
  if ("BroadcastChannel" in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.queueNumber) {
          onCall(event.data);
        }
      };
    } catch (err) {
      console.warn("BroadcastChannel listen error:", err);
    }
  }

  // 2. Listen via storage event
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue) as QueueBroadcastPayload;
        if (payload && payload.queueNumber) {
          onCall(payload);
        }
      } catch (err) {
        console.warn("Storage event parse error:", err);
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      channel.close();
    }
    window.removeEventListener("storage", handleStorage);
  };
}
