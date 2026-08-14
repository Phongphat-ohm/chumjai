"use client";

import { useState, useEffect } from "react";
import { getClinicSettingsAction } from "@/server/actions/settings";
import type { DocumentClinicInfo } from "@/components/documents/DocumentHeader";

/**
 * Hook to fetch clinic settings from DB and map them into DocumentClinicInfo.
 * Falls back to sensible defaults if fetching fails.
 */
export function useClinicSettings(): {
  clinicInfo: DocumentClinicInfo;
  isLoading: boolean;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [clinicInfo, setClinicInfo] = useState<DocumentClinicInfo>({
    clinicName: "คลินิก",
    address: "",
    phone: "",
    accentColor: "#1b5e3b",
    showLogo: false,
  });

  useEffect(() => {
    let cancelled = false;
    getClinicSettingsAction().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        const d = res.data;
        setClinicInfo({
          clinicName: d.CLINIC_NAME || "คลินิก",
          address: d.CLINIC_ADDRESS || "",
          phone: d.CLINIC_PHONE || "",
          email: d.CLINIC_EMAIL || undefined,
          licenseNo: d.CLINIC_LICENSE || undefined,
          directorName: d.CLINIC_DIRECTOR || undefined,
          // Level 2
          logoUrl: d.DOC_LOGO_URL || undefined,
          accentColor: d.DOC_ACCENT_COLOR || "#1b5e3b",
          showLogo: d.DOC_SHOW_LOGO === "true",
          footerText: d.DOC_FOOTER_TEXT || undefined,
          signatureTitle: d.DOC_SIGNATURE_TITLE || undefined,
        });
      }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { clinicInfo, isLoading };
}
