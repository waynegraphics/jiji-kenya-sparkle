import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function parseUserAgent(ua: string) {
  let deviceType = "desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? "tablet" : "mobile";
  }

  let osName = "Unknown";
  if (/Windows/i.test(ua)) osName = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) osName = "iOS";
  else if (/Mac OS/i.test(ua)) osName = "macOS";
  else if (/Android/i.test(ua)) osName = "Android";
  else if (/Linux/i.test(ua)) osName = "Linux";
  else if (/CrOS/i.test(ua)) osName = "ChromeOS";

  let browserName = "Unknown";
  if (/Edg\//i.test(ua)) browserName = "Edge";
  else if (/OPR|Opera/i.test(ua)) browserName = "Opera";
  else if (/Chrome/i.test(ua)) browserName = "Chrome";
  else if (/Safari/i.test(ua)) browserName = "Safari";
  else if (/Firefox/i.test(ua)) browserName = "Firefox";

  return { deviceType, osName, browserName };
}

export function useAffiliateClickTracker() {
  useEffect(() => {
    // Check URL params directly instead of useSearchParams (works outside Router too)
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (!refCode) return;

    // Store ref code in localStorage for later conversion tracking
    localStorage.setItem("affiliate_ref", refCode);

    const trackClick = async () => {
      // Check if we already tracked this click in this session
      const sessionKey = `affiliate_click_${refCode}`;
      if (sessionStorage.getItem(sessionKey)) return;

      // Lookup affiliate by referral code
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id")
        .eq("referral_code", refCode)
        .eq("status", "approved")
        .maybeSingle();

      if (!affiliate) return;

      const ua = navigator.userAgent;
      const { deviceType, osName, browserName } = parseUserAgent(ua);

      const { error } = await supabase.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        referral_code: refCode,
        user_agent: ua,
        device_type: deviceType,
        os_name: osName,
        browser_name: browserName,
        page_url: window.location.pathname,
      } as any);

      if (!error) {
        sessionStorage.setItem(sessionKey, "1");
      }
    };

    trackClick();
  }, []);
}
