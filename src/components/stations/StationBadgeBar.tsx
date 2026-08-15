"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Building2,
  Lock,
  Clock,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StationSelectorModal } from "./StationSelectorModal";
import {
  getServiceStationsAction,
  vacateStationAction,
} from "@/server/actions/station";
import { StationType } from "@/generated/client";

interface StationBadgeBarProps {
  filterType?: StationType;
  className?: string;
  onStationSelected?: (station: any) => void;
}

export function StationBadgeBar({
  filterType,
  className = "",
  onStationSelected,
}: StationBadgeBarProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState<any | null>(null);
  const [allStations, setAllStations] = useState<any[]>([]);

  const fetchCurrentStation = () => {
    startTransition(async () => {
      const res = await getServiceStationsAction(filterType);
      if (res.success && res.data) {
        setAllStations(res.data);
        // Find if current user is assigned or active in one of these stations
        // We can inspect activeUser
        const myStation = res.data.find((st: any) => st.activeUserId); // Or active user
        // We will match from stations where activeUser matches
        setCurrentStation(myStation || null);
        if (myStation) {
          onStationSelected?.(myStation);
        }
      }
    });
  };

  useEffect(() => {
    fetchCurrentStation();
  }, [filterType]);

  const handleVacate = () => {
    if (!currentStation) return;
    startTransition(async () => {
      const res = await vacateStationAction(currentStation.id);
      if (res.success) {
        setCurrentStation(null);
        fetchCurrentStation();
      }
    });
  };

  return (
    <>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
          currentStation
            ? "bg-slate-900 text-white border-slate-800 shadow-md"
            : "bg-amber-50 text-amber-900 border-amber-200"
        } ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              currentStation
                ? "bg-chunjai-600 text-white"
                : "bg-amber-200 text-amber-800"
            }`}
          >
            <Building2 className="h-4 w-4" />
          </div>

          <div>
            {currentStation ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  📍 ประจำการ: {currentStation.name}
                </span>
                {currentStation.activeUser && (
                  <span className="text-[11px] text-slate-300">
                    ({currentStation.activeUser.fullName})
                  </span>
                )}
                {currentStation.occupiedUntil && (
                  <span className="text-[10px] text-chunjai-300 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ถึง {new Date(currentStation.occupiedUntil).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                  </span>
                )}
                {currentStation.isLocked && (
                  <Badge className="bg-amber-500 text-white font-bold text-[10px] py-0">
                    <Lock className="mr-1 h-3 w-3" /> ล็อกห้อง
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-amber-900">
                  ยังไม่ได้เลือกห้อง/ช่องบริการเข้าปฏิบัติหน้าที่
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className={`text-xs font-bold ${
              currentStation
                ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                : "bg-amber-600 text-white hover:bg-amber-700 border-amber-700"
            }`}
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            {currentStation ? "สลับห้องบริการ" : "เลือกห้องประจำการ"}
            <ChevronDown className="ml-1 h-3 w-3 opacity-70" />
          </Button>

          {currentStation && !currentStation.isLocked && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleVacate}
              disabled={isPending}
              className="text-xs text-rose-300 hover:text-white hover:bg-rose-900/40"
              title="ออกจากห้องบริการนี้เพื่อปล่อยห้องว่าง"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <LogOut className="mr-1 h-3.5 w-3.5" />
                  ออกจากห้อง
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <StationSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filterType={filterType}
        onStationChanged={fetchCurrentStation}
      />
    </>
  );
}
