"use client";
import { useEffect } from "react";
import axios from "axios";

export const PageVisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      // Check if we are in a browser environment
      if (typeof window === "undefined") return;

      let browserId = localStorage.getItem("browserId");
      if (!browserId) {
        browserId = "br_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem("browserId", browserId);
      }

      const visitDate = new Date().toISOString().slice(0, 10);
      const visitKey = `visitTracked:${browserId}:${visitDate}`;
      if (localStorage.getItem(visitKey)) return;
      // Set synchronously so React Strict Mode's second effect setup does not POST again.
      localStorage.setItem(visitKey, "1");

      // Track visit session-wise or just once per day? 
      // The user said "add page visit per day to database using browser id".
      // Our API handles daily upsert, so calling it once per page load is fine.
      try {
        await axios.post("/api/track-visit", { browserId });
      } catch (error) {
        localStorage.removeItem(visitKey);
        console.error("Failed to track visit", error);
      }
    };

    trackVisit();
  }, []);

  return null;
};
