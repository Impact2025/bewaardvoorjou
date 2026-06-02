"use client";

import { useState, useEffect, useCallback } from "react";

const CONSENT_KEY_PREFIX = "bvj_recording_consent_v1";

function storageKey(userId: string) {
  return `${CONSENT_KEY_PREFIX}_${userId}`;
}

export function useRecordingConsent(userId: string | undefined) {
  const [consentGiven, setConsentGiven] = useState(true); // optimistic: true until we know
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(storageKey(userId));
    setConsentGiven(stored === "true");
    setChecked(true);
  }, [userId]);

  const giveConsent = useCallback(() => {
    if (!userId) return;
    localStorage.setItem(storageKey(userId), "true");
    setConsentGiven(true);
  }, [userId]);

  // isReady: we've checked localStorage (prevents flash)
  return { consentGiven, giveConsent, isReady: checked };
}
