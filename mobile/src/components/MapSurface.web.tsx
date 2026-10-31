import React from "react";
import { View } from "react-native";
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
      {React.createElement("iframe", {
        title: "OpenStreetMap of Banff and the surrounding area",
        src: mapUrl(props),
        style: { width: "100%", height: "100%", border: 0 },
        loading: "lazy",
        referrerPolicy: "no-referrer",
        sandbox: "allow-scripts allow-same-origin allow-popups",
      })}
    </View>
  );
}
