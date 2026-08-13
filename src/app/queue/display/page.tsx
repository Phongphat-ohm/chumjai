"use client";

import React, { useState, useEffect } from "react";
import { HeartPulse, Volume2, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getQueuesAction } from "@/server/actions/queue";
import { QueueStatus } from "@prisma/client";

export default function PublicQueueDisplayPage() {
  const [calledQueues, setCalledQueues] = useState<any[]>([]);
  const [waitingQueues, setWaitingQueues] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");

  const fetchDisplayQueues = async () => {
    const res = await getQueuesAction({ limit: 100 });
    if (res.success && res.data) {
      const called = res.data.filter(
        (q) => q.status === QueueStatus.CALLED || q.status === QueueStatus.SERVING
      );
      const waiting = res.data.filter((q) => q.status === QueueStatus.WAITING);

      setCalledQueues(called);
      setWaitingQueues(waiting);
    }
  };

  useEffect(() => {
    fetchDisplayQueues();
    const interval = setInterval(fetchDisplayQueues, 5000); // Auto refresh every 5s

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-chunjai-500">
      {/* Top Monitor Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-8 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chunjai-600 text-white shadow-lg shadow-chunjai-500/30">
            <HeartPulse className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              ชุมใจ <span className="text-chunjai-400 text-base font-medium">(Chunjai)</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              ระบบแสดงลำดับคิวรับบริการประจำวัน · Community Clinic Queue Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-chunjai-300">
              {currentTime || "--:--:--"}
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              {new Date().toLocaleDateString("th-TH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Screen Layout */}
      <div className="flex-1 p-6 md:p-8 grid gap-6 md:grid-cols-12">
        {/* Left Column: Currently Called Queues (Big Display) */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-chunjai-300 flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-chunjai-400 animate-bounce" />
              คิวที่กำลังเชิญเข้ารับบริการ (NOW CALLING)
            </h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              อัปเดตอัตโนมัติ
            </span>
          </div>

          {calledQueues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
              <Clock className="h-12 w-12 text-slate-600" />
              <p className="text-lg font-bold text-slate-400">
                ยังไม่มีการเรียกคิวในขณะนี้
              </p>
              <p className="text-xs text-slate-500">
                กรุณารอประกาศเรียกหมายเลขคิวของท่าน ณ จุดพักคอย
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {calledQueues.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border-2 border-chunjai-500 bg-gradient-to-br from-chunjai-950 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-3 transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-chunjai-300">
                      {q.queueType?.name}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-500/30">
                      เชิญเข้าบริการ
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <div className="text-6xl md:text-7xl font-black text-white font-mono tracking-tight drop-shadow-md">
                      {q.queueNumber}
                    </div>
                  </div>

                  <div className="text-center border-t border-slate-800 pt-3">
                    <p className="text-lg font-bold text-slate-100">
                      {q.visit?.patient?.firstName} {q.visit?.patient?.lastName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      HN: {q.visit?.patient?.hn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Waiting Queue List */}
        <div className="md:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-chunjai-400" />
              คิวที่รอรับบริการ (WAITING)
            </h3>
            <span className="text-xs text-chunjai-300 font-mono font-bold">
              {waitingQueues.length} คน
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {waitingQueues.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-12">
                ไม่มีคิวรอรับบริการ
              </div>
            ) : (
              waitingQueues.slice(0, 10).map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-850 bg-slate-900 text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-chunjai-400 font-mono">
                      {q.queueNumber}
                    </span>
                    <span className="text-slate-300 font-semibold">
                      {q.visit?.patient?.firstName} {q.visit?.patient?.lastName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                    {q.queueType?.prefix}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
