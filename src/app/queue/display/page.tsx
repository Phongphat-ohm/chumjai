"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HeartPulse,
  Volume2,
  VolumeX,
  Clock,
  Building2,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { getQueuesAction } from "@/server/actions/queue";
import { syncStationAutoShiftsAction } from "@/server/actions/station";
import { QueueStatus } from "@/generated/client";
import { queueAudioPlayer } from "@/lib/audio/queueAudioPlayer";
import { listenForQueueCalls, QueueBroadcastPayload } from "@/lib/audio/queueBroadcast";
import { Button } from "@/components/ui/button";

export default function PublicQueueDisplayPage() {
  const [calledQueues, setCalledQueues] = useState<any[]>([]);
  const [waitingQueues, setWaitingQueues] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [audioSuffix, setAudioSuffix] = useState<string>("ครับ");
  const [audioPrefix, setAudioPrefix] = useState<string>("ขอเชิญหมายเลข");

  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);

  useEffect(() => {
    setAudioSuffix(queueAudioPlayer.getSuffix());
    setAudioPrefix(queueAudioPlayer.getPrefix());
  }, []);

  const handleChangeSuffix = (val: string) => {
    setAudioSuffix(val);
    queueAudioPlayer.setSuffix(val);
  };

  const handleChangePrefix = (val: string) => {
    setAudioPrefix(val);
    queueAudioPlayer.setPrefix(val);
  };

  // Initialize with current timestamp on page load so old historical queues don't announce on refresh
  const lastAnnouncedTimestampRef = useRef<number>(Date.now() - 3000);
  const isAudioEnabledRef = useRef<boolean>(isAudioEnabled);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  const fetchDisplayQueues = async () => {
    // 1. Trigger shift sync in background
    syncStationAutoShiftsAction().catch(() => {});

    // 2. Fetch active queues
    const res = await getQueuesAction({ limit: 100 });
    if (res.success && res.data) {
      const called = res.data.filter(
        (q) => q.status === QueueStatus.CALLED || q.status === QueueStatus.SERVING
      );
      const waiting = res.data.filter((q) => q.status === QueueStatus.WAITING);

      // Check for newly called queues via polling timestamp check (fallback)
      called.forEach((q) => {
        if (q.status === QueueStatus.CALLED && q.calledAt) {
          const calledTimestamp = new Date(q.calledAt).getTime();
          if (calledTimestamp > lastAnnouncedTimestampRef.current) {
            lastAnnouncedTimestampRef.current = calledTimestamp;

            if (isAudioEnabledRef.current) {
              const destStation =
                q.serviceStation?.name || q.queueType?.name || "ช่องบริการ";
              queueAudioPlayer.enqueue({
                queueNumber: q.queueNumber,
                stationName: destStation,
              });
            }
          }
        }
      });

      setCalledQueues(called);
      setWaitingQueues(waiting);
    }
  };

  useEffect(() => {
    fetchDisplayQueues();

    // 1. Connect to Multi-Device Real-Time SSE Stream (Cross-device, Smart TV, Tablets, PCs)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/queue/stream");

      eventSource.onopen = () => {
        setIsSseConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "QUEUE_CALLED" && data.queueNumber) {
            fetchDisplayQueues();

            if (data.calledAt && data.calledAt >= lastAnnouncedTimestampRef.current - 1000) {
              lastAnnouncedTimestampRef.current = data.calledAt;
              if (isAudioEnabledRef.current) {
                queueAudioPlayer.enqueue({
                  queueNumber: data.queueNumber,
                  stationName: data.stationName || "ช่องบริการ",
                });
              }
            }
          } else if (data.type === "QUEUE_UPDATED") {
            fetchDisplayQueues();
          }
        } catch {
          // ignore non-json messages like ping
        }
      };

      eventSource.onerror = () => {
        setIsSseConnected(false);
      };
    } catch (err) {
      console.warn("EventSource setup error:", err);
    }

    // 2. Listen for Instant Same-Browser BroadcastChannel
    const unlistenBroadcast = listenForQueueCalls((payload: QueueBroadcastPayload) => {
      fetchDisplayQueues();
      if (payload.calledAt >= lastAnnouncedTimestampRef.current - 1000) {
        lastAnnouncedTimestampRef.current = payload.calledAt;
        if (isAudioEnabledRef.current) {
          queueAudioPlayer.enqueue({
            queueNumber: payload.queueNumber,
            stationName: payload.stationName,
          });
        }
      }
    });

    // 3. Fallback polling
    const interval = setInterval(fetchDisplayQueues, 5000);

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
      if (eventSource) {
        eventSource.close();
      }
      unlistenBroadcast();
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const handleTestAudio = () => {
    queueAudioPlayer.initAudio();
    queueAudioPlayer.enqueue({
      queueNumber: "A001",
      stationName: "ห้องตรวจแพทย์ 1",
    });
  };

  return (
    <div
      onClick={() => queueAudioPlayer.initAudio()}
      className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-chunjai-500"
    >
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
              ระบบแสดงลำดับคิวและช่องบริการประจำวัน · Multi-Station Queue Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Real-time SSE Connection Status */}
          <div className="hidden sm:flex items-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                isSseConnected
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                  : "bg-amber-950/80 text-amber-300 border-amber-700/60"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSseConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              {isSseConnected ? "Multi-Device Live (SSE)" : "Connecting..."}
            </span>
          </div>

          {/* Voice Prefix / Suffix Voice Settings */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold">คำนำหน้า:</span>
            <select
              value={audioPrefix}
              onChange={(e) => handleChangePrefix(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-chunjai-500"
            >
              <option value="ขอเชิญหมายเลข">ขอเชิญหมายเลข</option>
              <option value="เชิญหมายเลข">เชิญหมายเลข</option>
              <option value="ขอเชิญคิว">ขอเชิญคิว</option>
              <option value="เชิญคิว">เชิญคิว</option>
            </select>

            <span className="text-[11px] text-slate-400 font-semibold ml-1">หางเสียง:</span>
            <select
              value={audioSuffix}
              onChange={(e) => handleChangeSuffix(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-chunjai-500"
            >
              <option value="ครับ">ครับ</option>
              <option value="ค่ะ">ค่ะ</option>
              <option value="">ไม่มี</option>
            </select>
          </div>

          {/* Audio Announce Toggle & Test */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queueAudioPlayer.initAudio();
                setIsAudioEnabled(!isAudioEnabled);
              }}
              className={`h-8 text-xs font-semibold border-slate-700 ${
                isAudioEnabled
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="mr-1.5 h-4 w-4 text-emerald-400" />
                  เปิดเสียง ({audioSuffix || "มาตรฐาน"})
                </>
              ) : (
                <>
                  <VolumeX className="mr-1.5 h-4 w-4 text-slate-400" />
                  ปิดเสียง
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestAudio}
              className="h-8 text-xs text-slate-400 hover:text-white"
            >
              ทดสอบเสียง
            </Button>
          </div>

          <div className="text-right border-l border-slate-800 pl-6">
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
              อัปเดตอัตโนมัติ Real-time
            </span>
          </div>

          {calledQueues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
              <Clock className="h-12 w-12 text-slate-600" />
              <p className="text-lg font-bold text-slate-400">
                ยังไม่มีการเรียกคิวในขณะนี้
              </p>
              <p className="text-xs text-slate-500">
                กรุณารอประกาศเรียกหมายเลขคิวและห้องบริการของท่าน ณ จุดพักคอย
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {calledQueues.map((q) => {
                const stationName = q.serviceStation?.name || q.queueType?.name || "ช่องบริการ";
                const isServing = q.status === QueueStatus.SERVING;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border-2 p-6 shadow-2xl space-y-3 transition-transform hover:scale-[1.02] animate-in fade-in ${
                      isServing
                        ? "border-emerald-500/80 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950"
                        : "border-chunjai-400 bg-gradient-to-br from-chunjai-950/50 via-slate-900 to-slate-950 shadow-chunjai-500/10"
                    }`}
                  >
                    {/* Destination Room Header Banner */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-chunjai-500 text-white shadow-xs">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm md:text-base font-black text-chunjai-300 tracking-wide">
                          {stationName}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
                        isServing
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isServing ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`} />
                        {isServing ? "กำลังรับบริการ" : "📍 เชิญเข้ารับบริการ"}
                      </span>
                    </div>

                    {/* Big Queue Number */}
                    <div className="text-center py-2">
                      <div className="text-6xl md:text-7xl font-black text-white font-mono tracking-tight drop-shadow-lg">
                        {q.queueNumber}
                      </div>
                    </div>

                    {/* Patient & Attending Staff Info */}
                    <div className="text-center border-t border-slate-800 pt-3 space-y-1.5">
                      <p className="text-lg md:text-xl font-bold text-slate-100">
                        {q.visit?.patient?.firstName} {q.visit?.patient?.lastName}
                      </p>
                      <div className="flex items-center justify-center flex-wrap gap-3 text-xs text-slate-400 font-mono">
                        <span>HN: {q.visit?.patient?.hn}</span>
                        {q.serviceStation?.activeUser && (
                          <span className="text-chunjai-300 font-sans font-semibold flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                            <UserCheck className="h-3.5 w-3.5 text-chunjai-400" />
                            {q.serviceStation.activeUser.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              waitingQueues.slice(0, 12).map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-850 bg-slate-900 text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-chunjai-400 font-mono">
                      {q.queueNumber}
                    </span>
                    <div>
                      <span className="text-slate-300 font-semibold block">
                        {q.visit?.patient?.firstName} {q.visit?.patient?.lastName}
                      </span>
                      {q.visit?.labOrders?.length > 0 && (
                        q.visit.labOrders.every((l: any) => l.status === "COMPLETED") ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" /> ผลแล็บพร้อมแล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-medium">
                            • รอผลแล็บ
                          </span>
                        )
                      )}
                    </div>
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
