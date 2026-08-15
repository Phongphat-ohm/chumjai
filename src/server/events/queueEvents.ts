import { EventEmitter } from "events";

export interface QueueEventPayload {
  type: "QUEUE_CALLED" | "QUEUE_UPDATED" | "STATION_UPDATED";
  queueId?: string;
  queueNumber?: string;
  stationName?: string;
  stationId?: string;
  calledAt?: number;
  timestamp: number;
}

// Maintain a global singleton EventEmitter in Node.js server
declare global {
  // eslint-disable-next-line no-var
  var globalQueueEmitter: EventEmitter | undefined;
}

export const queueEventEmitter: EventEmitter =
  global.globalQueueEmitter || new EventEmitter();

// Allow unlimited client listeners for hospital displays & multi-room devices
queueEventEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  global.globalQueueEmitter = queueEventEmitter;
}

/**
 * Emit a real-time queue call event to all connected devices across the hospital network
 */
export function emitQueueEvent(event: Omit<QueueEventPayload, "timestamp">) {
  const fullPayload: QueueEventPayload = {
    ...event,
    timestamp: Date.now(),
  };
  queueEventEmitter.emit("queue_event", fullPayload);
}
