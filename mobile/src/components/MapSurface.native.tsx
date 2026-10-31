import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { MapSurfaceProps } from "./MapSurface.types";
import { createMapDocument, decodeMapMessage, isAllowedMapAttributionUrl, MAP_BASE_URL, MAP_USER_AGENT, mapUpdateMessage, mapViewState, safeScriptJson } from "../lib/mapDocument";

export default function MapSurface({ points, selectedId, onSelect, position, height = 400, viewArea = "all", onMapStatus }: MapSurfaceProps) {
  const webView = useRef<WebView>(null);
  const channel = useRef(`bb-map-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).current;
  const source = useMemo(() => ({ html: createMapDocument(channel), baseUrl: MAP_BASE_URL }), [channel]);
  const state = { ...mapViewState(points, selectedId, position), area: viewArea };
  const latest = useRef({ state, onSelect, onMapStatus });
  latest.current = { state, onSelect, onMapStatus };
  const [failed, setFailed] = useState(false);
  const receivedStatus = useRef(false);
  const sendUpdate = useCallback(() => {
    const message = mapUpdateMessage(channel, latest.current.state);
    webView.current?.injectJavaScript(`window.BanffBoundMap&&window.BanffBoundMap.update(${safeScriptJson(JSON.parse(message))});true;`);
  }, [channel]);
  const signature = JSON.stringify(state);
  useEffect(sendUpdate, [signature, sendUpdate]);
  useEffect(() => {
    const timer = setTimeout(() => { if (!receivedStatus.current) latest.current.onMapStatus?.("unavailable"); }, 16000);
    return () => clearTimeout(timer);
  }, []);
  const openAttribution = useCallback((url: string) => {
    if (isAllowedMapAttributionUrl(url)) Linking.openURL(url).catch(() => Alert.alert("Link unavailable", "Please try the OpenStreetMap link again when connected."));
  }, []);
  return <View style={{ height: Math.max(260, Math.min(800, height)), borderRadius: 20, overflow: "hidden", backgroundColor: "#e5ebe1" }}>
    <WebView
      ref={webView}
      source={source}
      style={{ flex: 1 }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled={false}
      cacheEnabled
      incognito={false}
      applicationNameForUserAgent={MAP_USER_AGENT}
      mixedContentMode="never"
      allowsInlineMediaPlayback={false}
      mediaPlaybackRequiresUserAction
      geolocationEnabled={false}
      javaScriptCanOpenWindowsAutomatically={false}
      setSupportMultipleWindows={false}
      allowsBackForwardNavigationGestures={false}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url === "about:blank" || request.url === MAP_BASE_URL) return true;
        if (isAllowedMapAttributionUrl(request.url)) openAttribution(request.url);
        return false;
      }}
      onOpenWindow={({ nativeEvent }) => openAttribution(nativeEvent.targetUrl)}
      onLoadEnd={sendUpdate}
      onError={() => { setFailed(true); latest.current.onMapStatus?.("unavailable"); }}
      onContentProcessDidTerminate={() => { setFailed(true); latest.current.onMapStatus?.("unavailable"); }}
      onRenderProcessGone={() => { setFailed(true); latest.current.onMapStatus?.("unavailable"); }}
      onMessage={({ nativeEvent }) => {
        const message = decodeMapMessage(nativeEvent.data, channel, new Set(latest.current.state.points.map((p) => p.id)));
        if (!message) return;
        if (message.type === "loaded") { setFailed(false); sendUpdate(); }
        else if (message.type === "select") latest.current.onSelect(message.id);
        else if (message.type === "status") { receivedStatus.current = true; latest.current.onMapStatus?.(message.status); }
        else if (message.type === "external") openAttribution(message.url);
      }}
      accessibilityLabel="Interactive map. Choose a category marker or grouped places. The map and place list use the same filters."
    />
    {failed && <View style={{ position: "absolute", top: 16, left: 16, right: 16, backgroundColor: "white", padding: 14, borderRadius: 12 }}><Text accessibilityRole="alert">Map unavailable. You can still choose places from the list.</Text></View>}
  </View>;
}
