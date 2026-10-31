import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "BanffBound",
  slug: "banffbound",
  owner: "spiresdigital",
  version: "1.0.0",
  scheme: "banffbound",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  ios: {
    bundleIdentifier: "com.banffbound.app",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "Show your location when you choose to find nearby Banff places.",
    },
  },
  android: {
    package: "com.banffbound.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#163b31",
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "POST_NOTIFICATIONS",
    ],
    blockedPermissions: ["RECORD_AUDIO", "READ_CONTACTS", "READ_PHONE_STATE"],
  },
  web: {
    bundler: "metro",
    output: "single",
    name: "BanffBound",
    shortName: "BanffBound",
    description: "Your Banff trip, organised and ready for the day.",
    themeColor: "#163b31",
    backgroundColor: "#f8f7f2",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash.png",
        imageWidth: 180,
        backgroundColor: "#163b31",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Find places near you when you choose to share your location.",
      },
    ],
    ["expo-notifications", { color: "#163b31" }],
  ],
  experiments: { baseUrl: process.env.BANFFBOUND_WEB_BASE || "/app" },
  extra: {
    eas: { projectId: "bc4566b5-997f-45fa-abca-eabf5b98630c" },
    contentOrigin: "https://banffbound.com",
    privacyUrl: "https://banffbound.com/app/privacy/",
  },
};
export default config;
