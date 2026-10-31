import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import type { MapSurfaceProps } from "./MapSurface.types";
import { createMapDocument, decodeMapMessage, isAllowedMapAttributionUrl, mapUpdateMessage, mapViewState } from "../lib/mapDocument";

export default function MapSurface({ points, selectedId, onSelect, position, height = 400, viewArea = "all", onMapStatus }: MapSurfaceProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const channel = useRef(`bb-map-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).current;
  const html = useMemo(() => createMapDocument(channel), [channel]);
  const state = { ...mapViewState(points, selectedId, position), area: viewArea };
  const latest = useRef({ state, onSelect, onMapStatus });
  latest.current = { state, onSelect, onMapStatus };
  const sendUpdate = useCallback(() => frame.current?.contentWindow?.postMessage(mapUpdateMessage(channel, latest.current.state), "*"), [channel]);
  const signature = JSON.stringify(state);
  useEffect(sendUpdate, [signature, sendUpdate]);
  useEffect(() => {
    let observedStatus = false;
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = decodeMapMessage(event.data, channel, new Set(latest.current.state.points.map((p) => p.id)));
      if (!message) return;
      if (message.type === "loaded") sendUpdate();
      else if (message.type === "select") latest.current.onSelect(message.id);
      else if (message.type === "status") { observedStatus = true; latest.current.onMapStatus?.(message.status); }
      else if (message.type === "external" && isAllowedMapAttributionUrl(message.url)) window.open(message.url, "_blank", "noopener,noreferrer");
    };
    window.addEventListener("message", receive);
    const timer = setTimeout(() => { if (!observedStatus) latest.current.onMapStatus?.("unavailable"); }, 16000);
    return () => { clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [channel, sendUpdate]);
  return <View style={{ height: Math.max(260, Math.min(800, height)), borderRadius: 20, overflow: "hidden", backgroundColor: "#e5ebe1" }}>
    {React.createElement("iframe", {
      ref: frame,
      title: "Interactive map. Choose a category marker or grouped places. The map and place list use the same filters.",
      srcDoc: html,
      style: { width: "100%", height: "100%", border: 0 },
      referrerPolicy: "origin",
      // The document is entirely bundled and text-only for POI data. A real origin retains the OSM Referer.
      sandbox: "allow-scripts allow-same-origin",
      onLoad: sendUpdate,
      onError: () => latest.current.onMapStatus?.("unavailable"),
    })}
  </View>;
}
