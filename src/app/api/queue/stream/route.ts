import { NextRequest } from "next/server";
import { queueEventEmitter, QueueEventPayload } from "@/server/events/queueEvents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Connection greeting
      const initData = JSON.stringify({
        type: "CONNECTED",
        message: "Queue SSE Stream Connected",
        timestamp: Date.now(),
      });
      controller.enqueue(encoder.encode(`data: ${initData}\n\n`));

      // 2. Listener for server-side queue events
      const onQueueEvent = (payload: QueueEventPayload) => {
        try {
          const sseData = `data: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        } catch (err) {
          console.warn("SSE Enqueue error:", err);
        }
      };

      queueEventEmitter.on("queue_event", onQueueEvent);

      // 3. Keep-alive heartbeat every 20 seconds
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 20000);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        queueEventEmitter.off("queue_event", onQueueEvent);
        try {
          controller.close();
        } catch {
          // Stream might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, max-age=0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in Nginx if used
    },
  });
}
