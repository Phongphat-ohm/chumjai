"use client";

import { Howl } from "howler";

/**
 * Hospital Queue Audio Engine
 * Features:
 * 1. Sequential Audio Queue Buffer (prevents voice overlapping when multiple rooms call at once)
 * 2. High-Quality Hospital Chime Tone (Ding-Dong) synthesized via Web Audio
 * 3. Natural Thai Number & Station Announcer
 */

interface QueueAnnouncementItem {
  id: string;
  queueNumber: string;
  stationName: string;
  counterNumber?: number;
  prefix?: string;
  suffix?: string;
  calledAt?: number;
}

class QueueAudioManager {
  private queue: QueueAnnouncementItem[] = [];
  private isPlaying: boolean = false;
  private audioCtx: AudioContext | null = null;
  private recentAnnouncements: Map<string, number> = new Map();

  // Configurable prefix and suffix (Default to "ครับ")
  private prefix: string = "ขอเชิญหมายเลข";
  private suffix: string = "ครับ";

  constructor() {
    // Load persisted settings from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const savedSuffix = localStorage.getItem("chunjai_audio_suffix");
        if (savedSuffix !== null) this.suffix = savedSuffix;
        const savedPrefix = localStorage.getItem("chunjai_audio_prefix");
        if (savedPrefix !== null) this.prefix = savedPrefix;
      } catch {
        // ignore
      }
    }
  }

  public getPrefix(): string {
    return this.prefix;
  }

  public setPrefix(val: string): void {
    this.prefix = val;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("chunjai_audio_prefix", val);
      } catch {}
    }
  }

  public getSuffix(): string {
    return this.suffix;
  }

  public setSuffix(val: string): void {
    this.suffix = val;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("chunjai_audio_suffix", val);
      } catch {}
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public initAudio(): void {
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    } catch (e) {
      console.warn("Audio init error", e);
    }
  }

  /**
   * Play Hospital Chime (Ding-Dong dual tone)
   */
  public async playChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) {
          resolve();
          return;
        }

        const now = ctx.currentTime;

        // Tone 1: High Bell (587.33 Hz - D5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Tone 2: Low Bell (440 Hz - A4)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(440, now + 0.35);
        gain2.gain.setValueAtTime(0.35, now + 0.35);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.35);
        osc2.stop(now + 1.1);

        setTimeout(resolve, 900);
      } catch (err) {
        console.warn("Chime playback error:", err);
        resolve();
      }
    });
  }

  /**
   * Spell Thai Queue Number
   * e.g., 'A001' -> 'เอ , ศูนย์ , ศูนย์ , หนึ่ง'
   */
  private formatQueueSpelling(queueNumber: string): string {
    const charMap: Record<string, string> = {
      A: "เอ",
      B: "บี",
      C: "ซี",
      D: "ดี",
      E: "อี",
      P: "พี",
      T: "ที",
      R: "อาร์",
      "0": "ศูนย์",
      "1": "หนึ่ง",
      "2": "สอง",
      "3": "สาม",
      "4": "สี่",
      "5": "ห้า",
      "6": "หก",
      "7": "เจ็ด",
      "8": "แปด",
      "9": "เก้า",
    };

    return queueNumber
      .toUpperCase()
      .split("")
      .map((c) => charMap[c] || c)
      .join(" , ");
  }

  /**
   * Speak a text string in Thai
   */
  private async speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "th-TH";
      utterance.rate = 0.80; // Slower, calm, clear hospital announcement cadence
      utterance.pitch = 1.0; // Natural tone

      // Try finding Thai voice
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(
        (v) => v.lang === "th-TH" || v.lang.startsWith("th")
      );
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Process Queue Announcements sequentially
   */
  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.queue.length === 0) return;

    this.isPlaying = true;
    const item = this.queue.shift();

    if (item) {
      try {
        // 1. Play Hospital Chime (Ding-Dong)
        await this.playChime();

        // 2. Format Speech with clear cadence & configured prefix/suffix
        const spelledQueue = this.formatQueueSpelling(item.queueNumber);
        const destination = item.stationName || "ช่องบริการ";
        const prefix = item.prefix || this.prefix || "ขอเชิญหมายเลข";
        const suffix = item.suffix !== undefined ? item.suffix : this.suffix;

        const sentence = `${prefix} , ${spelledQueue} , ที่ ${destination} ${suffix ? `${suffix}` : ""}`;

        // 3. Announce voice
        await this.speakText(sentence);
      } catch (err) {
        console.error("Queue announcement failed:", err);
      }
    }

    this.isPlaying = false;

    // Continue to next announcement in queue if any
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 400);
    }
  }

  /**
   * Public: Add queue announcement to audio queue with automatic deduplication
   */
  public enqueue(item: {
    queueNumber: string;
    stationName: string;
    counterNumber?: number;
    prefix?: string;
    suffix?: string;
    calledAt?: number;
  }): void {
    // 1. Deduplication: prevent the same queue number and station from repeating if triggered by multiple transports (SSE, Broadcast, Polling) within 4 seconds
    const dedupeKey = `${item.queueNumber}-${item.stationName}`;
    const now = Date.now();
    const lastTime = this.recentAnnouncements.get(dedupeKey);
    if (lastTime && now - lastTime < 4000) {
      // Discard duplicate broadcast received within 4 seconds
      return;
    }
    this.recentAnnouncements.set(dedupeKey, now);

    // Prune old dedupe keys to keep memory clean
    if (this.recentAnnouncements.size > 100) {
      for (const [k, t] of this.recentAnnouncements.entries()) {
        if (now - t > 60000) this.recentAnnouncements.delete(k);
      }
    }

    this.queue.push({
      id: `${Date.now()}-${Math.random()}`,
      prefix: item.prefix || this.prefix,
      suffix: item.suffix !== undefined ? item.suffix : this.suffix,
      ...item,
    });
    this.processQueue();
  }

  public clear(): void {
    this.queue = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
  }
}

// Singleton Instance
export const queueAudioPlayer = new QueueAudioManager();
