import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import type { MapSurfaceProps } from "./MapSurface.types";
import { mapUrl } from "./MapSurface.types";
export default function MapSurface(props: MapSurfaceProps) {
  return (
    <View
      style={{
        height: 330,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#e5ebe1",
      }}
    >
      <WebView
        source={{ uri: mapUrl(props) }}
        style={{ flex: 1 }}
        originWhitelist={["https://www.openstreetmap.org"]}
        javaScriptEnabled
        accessibilityLabel="OpenStreetMap of Banff and the surrounding area"
      />
    </View>
  );
}
