import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import {
  places,
  guides,
  dataVersion,
  plannerTemplatesForApp,
  photoCredits,
  type Place,
  type Guide,
} from "./src/data/catalog";
import {
  activityById,
  activityFitsSeason,
  plannerActivities,
  plannerTemplates,
  tripPlanWarnings,
  type TripBase,
} from "./src/data/planner.generated";
import {
  calculateParkPassPlan,
  defaultParkPassInputs,
  formatParkPassMoney,
  parkPassReviewedAt,
  parkPassOptions,
} from "./src/data/parkPass.generated";
import {
  fetchEcccWeather,
  unavailableMobileWeather,
  WEATHER_MAX_AGE_MS,
  type MobileWeather,
  type WeatherArea,
} from "./src/data/weather";
import { useTripStore } from "./src/lib/useTripStore";
import {
  addActivity,
  addPlaceToDay,
  addCalendarDays,
  addDay,
  applyTemplate,
  banffDate,
  budgetTotal,
  changeSeason,
  importTripPack,
  isValidDate,
  isValidTime,
  moveActivity,
  newBookingId,
  packingItems,
  removeActivity,
  removeDay,
  removeTripDay,
  selectDayPlace,
  tripDayIndex,
  warningsForTrip,
  formatBanffDateTime,
  BANFF_TIME_POLICY,
  type AppState,
  type Booking,
  type Budget,
} from "./src/lib/trip";
import {
  requestReminderPermission,
  syncBookingReminders,
} from "./src/lib/notifications";
import {
  clearOfflinePack,
  saveOfflinePack,
  shareTrip,
  shareTripPack,
  pickTripPack,
} from "./src/lib/offline";
import MapSurface from "./src/components/MapSurface";
import {
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Loading,
  Notice,
  SectionTitle,
  baseNames,
  categoryIcons,
  categoryNames,
  colors,
  s,
  serif,
} from "./src/components/ui";

type Tab = "Today" | "Explore" | "Map" | "My Trip" | "Essentials";
type Panel =
  | { type: "activity-detail"; activityId: string }
  | { type: "place"; place: Place }
  | { type: "guide"; guide: Guide }
  | { type: "activities"; day: number }
  | { type: "booking"; booking?: Booking }
  | {
      type:
        | "settings"
        | "templates"
        | "budget"
        | "pass"
        | "offline"
        | "privacy"
        | "saved"
        | "about"
        | "import"
        | "reset";
    };
const tabIcons: Record<Tab, keyof typeof Ionicons.glyphMap> = {
  Today: "sunny-outline",
  Explore: "compass-outline",
  Map: "map-outline",
  "My Trip": "calendar-outline",
  Essentials: "grid-outline",
};
const pictures = {
  lake: require("./assets/lake.jpg"),
  moraine: require("./assets/moraine.jpg"),
  town: require("./assets/town.jpg"),
  winter: require("./assets/winter.jpg"),
  canmore: require("./assets/canmore.jpg"),
  gondola: require("./assets/gondola.jpg"),
  food: require("./assets/food.jpg"),
};
function picture(place: Place) {
  if (place.category === "lakes")
    return place.name.includes("Moraine") ? pictures.moraine : pictures.lake;
  if (place.area === "canmore") return pictures.canmore;
  if (place.category === "food") return pictures.food;
  if (place.category === "winter") return pictures.winter;
  if (place.name.includes("Gondola")) return pictures.gondola;
  return pictures.town;
}
function dateLabel(date: string, short = false) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    month: short ? "short" : "long",
    day: "numeric",
    ...(!short ? { weekday: "long" as const } : {}),
  }).format(new Date(`${date}T12:00:00Z`));
}
function openUrl(url: string) {
  if (!/^https:\/\//.test(url)) return;
  void Linking.openURL(url).catch(() =>
    Alert.alert("Unable to open link", "Check your connection and try again."),
  );
}
function distance(a: { latitude: number; longitude: number }, p: Place) {
  if (p.latitude === undefined || p.longitude === undefined) return Infinity;
  const r = Math.PI / 180,
    dlat = (p.latitude - a.latitude) * r,
    dlon = (p.longitude - a.longitude) * r;
  return (
    6371 *
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(dlat / 2) ** 2 +
          Math.cos(a.latitude * r) *
            Math.cos(p.latitude * r) *
            Math.sin(dlon / 2) ** 2,
      ),
    )
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <BanffApp />
    </SafeAreaProvider>
  );
}
function BanffApp() {
  const { state, ready, error, update, reset } = useTripStore();
  const [tab, setTab] = useState<Tab>("Today");
  const [panel, setPanel] = useState<Panel | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [area, setArea] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const scroll = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  useEffect(() => {
    if (ready)
      void syncBookingReminders(state.bookings, state.remindersEnabled).catch(
        () =>
          setToast(
            "Reminders could not be updated. Check notification permissions.",
          ),
      );
  }, [state.bookings, ready, state.remindersEnabled]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const win = globalThis as any;
    const refresh = () => setOnline(win.navigator.onLine);
    refresh();
    win.addEventListener("online", refresh);
    win.addEventListener("offline", refresh);
    return () => {
      win.removeEventListener("online", refresh);
      win.removeEventListener("offline", refresh);
    };
  }, []);
  const visible = useMemo(
    () =>
      places
        .filter(
          (p) =>
            (category === "all" || p.category === category) &&
            (area === "all" || p.area === area) &&
            (!savedOnly || state.savedPlaceIds.includes(p.id)) &&
            (!search ||
              `${p.name} ${p.description} ${categoryNames[p.category]} ${baseNames[p.area]}`
                .toLowerCase()
                .includes(search.toLowerCase())),
        )
        .sort((a, b) =>
          position ? distance(position, a) - distance(position, b) : 0,
        ),
    [search, category, area, savedOnly, state.savedPlaceIds, position],
  );
  const toggleSave = (id: string) =>
    update((prev) => ({
      ...prev,
      savedPlaceIds: prev.savedPlaceIds.includes(id)
        ? prev.savedPlaceIds.filter((v) => v !== id)
        : [...prev.savedPlaceIds, id],
    }));
  const navigate = (next: Tab) => {
    setTab(next);
    setPanel(null);
  };
  const dayIndex = tripDayIndex(state);
  const shownDay = dayIndex ?? 0;
  const dayIds = state.trip.days[shownDay] || [];
  const warnings = warningsForTrip(state);
  const featured = places
    .filter(
      (p) =>
        ["lakes", "attractions", "winter"].includes(p.category) &&
        p.season !== (state.trip.season === "winter" ? "summer" : "winter"),
    )
    .slice(0, 4);
  const openActivity = (id: string, day: number) => {
    const place = places.find((p) => p.id === state.dayPlaces[`${day}:${id}`]);
    if (place) setPanel({ type: "place", place });
    else setPanel({ type: "activity-detail", activityId: id });
  };
  async function locate() {
    setLocationMessage("Finding your location…");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationMessage(
          "Location is off. You can still choose an area and browse every place.",
        );
        return;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPosition(result.coords);
      setLocationMessage(
        "Places with coordinates are sorted by distance. Distances are straight-line estimates.",
      );
    } catch {
      setLocationMessage(
        "Your location is unavailable. Choose an area instead.",
      );
    }
  }
  async function download() {
    setBusy(true);
    try {
      const result = await saveOfflinePack(state);
      update((prev) => ({ ...prev, downloadedAt: result.savedAt }));
      setToast(result.message);
    } catch (e) {
      setToast(
        e instanceof Error
          ? e.message
          : "Could not save this trip. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function enableReminders() {
    try {
      const allowed = await requestReminderPermission();
      if (!allowed) {
        setToast(
          Platform.OS === "web"
            ? "Booking reminders are available in the iPhone and Android apps."
            : "Notifications are off. Enable them in device settings to use reminders.",
        );
        return;
      }
      update((prev) => ({ ...prev, remindersEnabled: true }));
      const result = await syncBookingReminders(state.bookings, true);
      setToast(
        `${result.scheduled} upcoming reminder${result.scheduled === 1 ? "" : "s"} scheduled. All booking times use Banff time.`,
      );
    } catch {
      setToast("Reminders could not be enabled. Check your device settings.");
    }
  }
  if (!ready) return <Loading />;
  return (
    <SafeAreaView style={a.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[a.shell, wide && a.wideShell]}>
        {wide && (
          <View style={a.sidebar}>
            <View style={a.brandRow}>
              <Image source={require("./assets/icon.png")} style={a.logo} />
              <Text style={a.wordmark}>BanffBound</Text>
            </View>
            <Text style={[s.eyebrow, { marginTop: 10, marginBottom: 42 }]}>
              A LITTLE CLOSER TO THE MOUNTAINS
            </Text>
            {(Object.keys(tabIcons) as Tab[]).map((name) => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                aria-selected={tab === name}
                accessibilityState={{ selected: tab === name }}
                onPress={() => navigate(name)}
                style={[
                  a.sideItem,
                  tab === name && { backgroundColor: colors.pale },
                ]}
              >
                <Ionicons name={tabIcons[name]} size={22} color={colors.pine} />
                <Text
                  style={{
                    color: colors.pine,
                    fontWeight: tab === name ? "700" : "400",
                    fontSize: 15,
                  }}
                >
                  {name}
                </Text>
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <Notice>Made for your time in Banff, Lake Louise & Canmore.</Notice>
            <Pressable
              onPress={() => setPanel({ type: "privacy" })}
              accessibilityRole="button"
              style={{ marginTop: 24 }}
            >
              <Text style={s.link}>Privacy & your data</Text>
            </Pressable>
          </View>
        )}
        <View style={a.main}>
          <View style={a.header}>
            <View>
              <Text style={s.eyebrow}>
                {tab === "Today"
                  ? "YOUR ROCKIES COMPANION"
                  : tab === "My Trip"
                    ? "A LITTLE PLANNING. A LOT OF POSSIBILITY."
                    : "BANFF · LAKE LOUISE · CANMORE"}
              </Text>
              <Text style={a.pageTitle}>
                {tab === "Today"
                  ? "Hello, adventure."
                  : tab === "Explore"
                    ? "Find your kind of Banff."
                    : tab === "Map"
                      ? "Get your bearings."
                      : tab === "My Trip"
                        ? "Your trip, your pace."
                        : "The useful little things."}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open trip settings"
              onPress={() => setPanel({ type: "settings" })}
              style={a.profile}
            >
              <Ionicons name="options-outline" size={22} color={colors.pine} />
            </Pressable>
          </View>
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={[
              a.content,
              wide && { paddingHorizontal: 36 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {error && <Notice icon="warning-outline">{error}</Notice>}
            {!online && (
              <Notice icon="cloud-offline-outline">
                You're offline. Your saved trip and bundled guides are here;
                maps and external links need a connection.
              </Notice>
            )}
            {tab === "Today" && (
              <>
                <ImageBackground
                  source={
                    state.trip.season === "winter"
                      ? pictures.winter
                      : pictures.lake
                  }
                  style={[a.hero, wide && { height: 330 }]}
                  imageStyle={{ borderRadius: 23 }}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(10,34,27,.88)"]}
                    style={a.heroShade}
                  >
                    <View style={a.heroTop}>
                      <View style={a.whitePill}>
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color={colors.white}
                        />
                        <Text style={a.pillText}>
                          {baseNames[state.trip.base]}, Alberta
                        </Text>
                      </View>
                      <Text style={a.heroBadge}>
                        {state.trip.season === "winter"
                          ? "WINTER WANDERINGS"
                          : "MOUNTAIN DAYS"}
                      </Text>
                    </View>
                    <View>
                      <Text style={a.heroTitle}>
                        {dayIndex === null
                          ? "Good days start\nwith a little planning."
                          : "The mountains\nare calling."}
                      </Text>
                      <Text style={a.heroSub}>
                        {state.trip.days.length} days ·{" "}
                        {state.trip.transport === "car-free"
                          ? "Car-free adventure"
                          : "Exploring by car"}{" "}
                        · {state.party.adults + state.party.children} travellers
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => navigate("My Trip")}
                        style={a.heroButton}
                      >
                        <Text style={{ fontWeight: "600", color: colors.pine }}>
                          Make it your trip
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={17}
                          color={colors.pine}
                        />
                      </Pressable>
                    </View>
                  </LinearGradient>
                </ImageBackground>
                <View style={[a.quickRow, wide && { gap: 14 }]}>
                  {[
                    {
                      icon: "calendar-outline" as const,
                      label: "Your itinerary",
                      action: () => navigate("My Trip"),
                    },
                    {
                      icon: "bookmark-outline" as const,
                      label: "Saved places",
                      action: () => setPanel({ type: "saved" }),
                    },
                    {
                      icon: "cloud-download-outline" as const,
                      label: "Go offline",
                      action: () => setPanel({ type: "offline" }),
                    },
                  ].map((item) => (
                    <Pressable
                      key={item.label}
                      accessibilityRole="button"
                      onPress={item.action}
                      style={a.quickItem}
                    >
                      <Ionicons
                        name={item.icon}
                        size={23}
                        color={colors.green}
                      />
                      <Text style={a.quickText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <View>
                  <SectionTitle
                    title={
                      dayIndex === null
                        ? "Your first mountain day"
                        : `Today · Day ${shownDay + 1}`
                    }
                    action="View trip"
                    onPress={() => navigate("My Trip")}
                  />
                  <Card>
                    <View
                      style={[
                        s.row,
                        { justifyContent: "space-between", marginBottom: 18 },
                      ]}
                    >
                      <View>
                        <Text style={s.eyebrow}>
                          {dateLabel(
                            addCalendarDays(state.startDate, shownDay),
                          ).toUpperCase()}
                        </Text>
                        <Text style={[s.h3, { marginTop: 6 }]}>
                          {baseNames[state.trip.base]} & beyond
                        </Text>
                      </View>
                      <View style={a.roundIcon}>
                        <Ionicons
                          name={
                            state.trip.transport === "drive"
                              ? "car-outline"
                              : "bus-outline"
                          }
                          size={21}
                          color={colors.green}
                        />
                      </View>
                    </View>
                    {dayIds.length ? (
                      dayIds.map((id, index) => (
                        <ActivityRow
                          key={id}
                          id={id}
                          index={index}
                          placeId={state.dayPlaces[`${shownDay}:${id}`]}
                          onPress={() => openActivity(id, shownDay)}
                        />
                      ))
                    ) : (
                      <Text style={s.body}>
                        An open day. Leave room to wander, or add an outing.
                      </Text>
                    )}
                    <View style={s.divider} />
                    <Text style={s.body}>
                      Confirm your outward and return journey before setting
                      off. Activity times are planning allowances.
                    </Text>
                  </Card>
                </View>
                <WeatherCard area={state.trip.base} />
                <View>
                  <SectionTitle
                    title="A few places to fall for"
                    action="Explore all"
                    onPress={() => navigate("Explore")}
                  />
                  <View style={[a.placeGrid, wide && a.twoCols]}>
                    {featured.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        saved={state.savedPlaceIds.includes(place.id)}
                        onSave={() => toggleSave(place.id)}
                        onPress={() => setPanel({ type: "place", place })}
                        wide={wide}
                      />
                    ))}
                  </View>
                </View>
                <Card style={a.pineCard}>
                  <View style={s.row}>
                    <Ionicons
                      name="trail-sign-outline"
                      size={28}
                      color={colors.gold}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.h2, { color: colors.white }]}>
                        Before you head out
                      </Text>
                      <Text
                        style={{
                          color: "#d8e3d9",
                          fontSize: 14,
                          lineHeight: 22,
                          marginTop: 7,
                        }}
                      >
                        A quick check makes a better mountain day.
                      </Text>
                    </View>
                  </View>
                  <View style={[s.wrap, { marginTop: 18 }]}>
                    <Button
                      title="Official weather"
                      variant="secondary"
                      small
                      icon="cloud-outline"
                      onPress={() =>
                        openUrl(
                          "https://weather.gc.ca/en/location/index.html?coords=51.18,-115.57",
                        )
                      }
                    />
                    <Button
                      title="Road reports"
                      variant="secondary"
                      small
                      icon="car-outline"
                      onPress={() => openUrl("https://511.alberta.ca/")}
                    />
                    <Button
                      title="Trail conditions"
                      variant="secondary"
                      small
                      icon="trail-sign-outline"
                      onPress={() =>
                        openUrl(
                          "https://parks.canada.ca/pn-np/ab/banff/activ/randonnee-hiking/etat-sentiers-trail-conditions",
                        )
                      }
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#bccfc4",
                      lineHeight: 19,
                      marginTop: 15,
                    }}
                  >
                    Official reports open with a connection. A saved plan does
                    not confirm current access or conditions.
                  </Text>
                </Card>
              </>
            )}
            {(tab === "Explore" || tab === "Map") && (
              <>
                <View style={a.searchBox}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.muted}
                  />
                  <TextInput
                    accessibilityLabel="Search places"
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Lakes, little cafés, your next adventure…"
                    placeholderTextColor={colors.muted}
                    style={a.searchInput}
                  />
                  {search && (
                    <Pressable
                      accessibilityLabel="Clear search"
                      onPress={() => setSearch("")}
                    >
                      <Ionicons
                        name="close-circle"
                        size={19}
                        color={colors.muted}
                      />
                    </Pressable>
                  )}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingBottom: 3 }}
                >
                  {[
                    "all",
                    "lakes",
                    "walks",
                    "attractions",
                    "food",
                    "winter",
                    "stays",
                    "essentials",
                  ].map((key) => (
                    <Chip
                      key={key}
                      label={categoryNames[key]}
                      icon={categoryIcons[key]}
                      selected={category === key}
                      onPress={() => setCategory(key)}
                    />
                  ))}
                </ScrollView>
                <View style={[s.wrap, { alignItems: "center" }]}>
                  {["all", "banff", "louise", "canmore"].map((key) => (
                    <Chip
                      key={key}
                      label={
                        key === "all" ? "All areas" : baseNames[key as TripBase]
                      }
                      selected={area === key}
                      onPress={() => setArea(key)}
                    />
                  ))}
                  <Chip
                    label="Saved"
                    icon="bookmark-outline"
                    selected={savedOnly}
                    onPress={() => setSavedOnly(!savedOnly)}
                  />
                </View>
                {tab === "Map" && (
                  <>
                    <MapSurface
                      latitude={selectedPlace?.latitude}
                      longitude={selectedPlace?.longitude}
                    />
                    <View style={[s.row, { justifyContent: "space-between" }]}>
                      <Text style={[s.body, { flex: 1, fontSize: 12 }]}>
                        © OpenStreetMap contributors · online map
                      </Text>
                      <Button
                        title="Near me"
                        icon="locate-outline"
                        small
                        variant="secondary"
                        onPress={locate}
                      />
                    </View>
                    {locationMessage && <Notice>{locationMessage}</Notice>}
                    <Notice>
                      Only places with reviewed coordinates can be focused on
                      the map. Saved place details remain available offline.
                    </Notice>
                  </>
                )}
                <View style={s.sectionTitle}>
                  <Text style={s.h2}>
                    {tab === "Map"
                      ? "Places on your radar"
                      : "A place for every kind of day"}
                  </Text>
                  <Text style={s.body}>{visible.length}</Text>
                </View>
                {!visible.length ? (
                  <Empty
                    title="A little further afield?"
                    body="Try a different area or category, or clear your search."
                    action="Reset filters"
                    onPress={() => {
                      setSearch("");
                      setArea("all");
                      setCategory("all");
                      setSavedOnly(false);
                    }}
                  />
                ) : (
                  <View style={[a.placeGrid, wide && a.twoCols]}>
                    {visible.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        saved={state.savedPlaceIds.includes(place.id)}
                        onSave={() => toggleSave(place.id)}
                        onPress={() =>
                          tab === "Map" && place.coordinateStatus === "verified"
                            ? (setSelectedPlace(place),
                              setPanel({ type: "place", place }))
                            : setPanel({ type: "place", place })
                        }
                        wide={wide}
                        mapAction={
                          tab === "Map" &&
                          place.coordinateStatus === "verified" &&
                          place.latitude !== undefined
                            ? () => {
                                setSelectedPlace(place);
                                scroll.current?.scrollTo({
                                  y: 0,
                                  animated: true,
                                });
                              }
                            : undefined
                        }
                      />
                    ))}
                  </View>
                )}
              </>
            )}
            {tab === "My Trip" && (
              <>
                <Card>
                  <View style={[s.row, { justifyContent: "space-between" }]}>
                    <View>
                      <Text style={s.eyebrow}>
                        YOUR {state.trip.season.toUpperCase()} GETAWAY
                      </Text>
                      <Text style={[s.h2, { marginTop: 7 }]}>
                        {state.trip.days.length} days in the Rockies
                      </Text>
                      <Text style={[s.body, { marginTop: 7 }]}>
                        {dateLabel(state.startDate, true)} ·{" "}
                        {baseNames[state.trip.base]} ·{" "}
                        {state.trip.transport === "drive"
                          ? "With a car"
                          : "Car-free"}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Edit trip details"
                      onPress={() => setPanel({ type: "settings" })}
                    >
                      <Ionicons
                        name="create-outline"
                        size={25}
                        color={colors.green}
                      />
                    </Pressable>
                  </View>
                  <View style={[s.wrap, { marginTop: 20 }]}>
                    <Button
                      title="Trip details"
                      variant="secondary"
                      small
                      icon="options-outline"
                      onPress={() => setPanel({ type: "settings" })}
                    />
                    <Button
                      title="Trip ideas"
                      variant="ghost"
                      small
                      icon="sparkles-outline"
                      onPress={() => setPanel({ type: "templates" })}
                    />
                    <Button
                      title="Share"
                      variant="ghost"
                      small
                      icon="share-outline"
                      onPress={() =>
                        void shareTrip(state).catch((e) => setToast(e.message))
                      }
                    />
                  </View>
                </Card>
                {state.trip.days.map((ids, index) => (
                  <View key={index}>
                    <SectionTitle
                      title={`Day ${index + 1} · ${dateLabel(addCalendarDays(state.startDate, index), true)}`}
                      action={
                        state.trip.days.length > 1 ? "Remove day" : undefined
                      }
                      onPress={() =>
                        update((prev) => removeTripDay(prev, index))
                      }
                    />
                    <Card>
                      {ids.length ? (
                        ids.map((id, activityIndex) => (
                          <View key={id}>
                            <ActivityRow
                              id={id}
                              index={activityIndex}
                              placeId={state.dayPlaces[`${index}:${id}`]}
                              onPress={() => openActivity(id, index)}
                            />
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 14,
                                marginLeft: 46,
                                marginBottom: 16,
                              }}
                            >
                              {activityIndex > 0 && (
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Move ${activityById[id].name} earlier`}
                                  onPress={() =>
                                    update((prev) => ({
                                      ...prev,
                                      trip: moveActivity(
                                        prev.trip,
                                        index,
                                        activityIndex,
                                        -1,
                                      ),
                                    }))
                                  }
                                >
                                  <Text style={s.link}>↑ Earlier</Text>
                                </Pressable>
                              )}
                              {activityIndex < ids.length - 1 && (
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Move ${activityById[id].name} later`}
                                  onPress={() =>
                                    update((prev) => ({
                                      ...prev,
                                      trip: moveActivity(
                                        prev.trip,
                                        index,
                                        activityIndex,
                                        1,
                                      ),
                                    }))
                                  }
                                >
                                  <Text style={s.link}>↓ Later</Text>
                                </Pressable>
                              )}
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${activityById[id].name}`}
                                onPress={() =>
                                  update((prev) => ({
                                    ...prev,
                                    trip: removeActivity(prev.trip, index, id),
                                  }))
                                }
                              >
                                <Text style={[s.link, { color: colors.muted }]}>
                                  Remove
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={[s.body, { marginBottom: 18 }]}>
                          Room for a rest, a spontaneous coffee or a new
                          adventure.
                        </Text>
                      )}
                      <Button
                        title={
                          ids.length >= 3
                            ? "Day is full · three outings maximum"
                            : "Add an outing"
                        }
                        disabled={ids.length >= 3}
                        variant="secondary"
                        icon="add-outline"
                        onPress={() =>
                          setPanel({ type: "activities", day: index })
                        }
                      />
                    </Card>
                  </View>
                ))}
                {state.trip.days.length < 7 && (
                  <Button
                    title="Add another day"
                    variant="ghost"
                    icon="add-outline"
                    onPress={() =>
                      update((prev) => ({ ...prev, trip: addDay(prev.trip) }))
                    }
                  />
                )}
                {warnings.length > 0 && (
                  <View>
                    <SectionTitle title="A little planning advice" />
                    <Card style={{ gap: 13 }}>
                      {warnings.map((warning, index) => (
                        <Text key={index} style={[s.body, { fontSize: 13 }]}>
                          • {warning}
                        </Text>
                      ))}
                    </Card>
                  </View>
                )}
                <View>
                  <SectionTitle
                    title="Bookings & little reminders"
                    action="Add"
                    onPress={() => setPanel({ type: "booking" })}
                  />
                  {!state.bookings.length ? (
                    <Empty
                      icon="ticket-outline"
                      title="Keep the details together"
                      body="Add reservation times, transport tasks and meeting-point notes. You control your checklist."
                      action="Add a booking task"
                      onPress={() => setPanel({ type: "booking" })}
                    />
                  ) : (
                    <Card style={{ gap: 18 }}>
                      {state.bookings.map((booking) => (
                        <View key={booking.id}>
                          <View style={s.row}>
                          <Pressable
                            accessibilityRole="checkbox"
                            accessibilityState={{
                              checked: booking.markedBooked,
                            }}
                            aria-checked={booking.markedBooked}
                            accessibilityLabel={booking.title}
                            onPress={() =>
                              update((prev) => ({
                                ...prev,
                                bookings: prev.bookings.map((b) =>
                                  b.id === booking.id
                                    ? { ...b, markedBooked: !b.markedBooked }
                                    : b,
                                ),
                              }))
                            }
                            hitSlop={9}
                          >
                            <Ionicons
                              name={
                                booking.markedBooked
                                  ? "checkbox"
                                  : "square-outline"
                              }
                              size={24}
                              color={colors.green}
                            />
                          </Pressable>
                            <View style={{ flex: 1 }}>
                              <Text style={s.h3}>{booking.title}</Text>
                              <Text style={s.body}>
                                {booking.date
                                  ? dateLabel(booking.date, true)
                                  : "Date to confirm"}
                                {booking.time
                                  ? ` · ${booking.time} Banff time`
                                  : ""}
                              </Text>
                              <Text style={[s.body, { fontSize: 12 }]}>
                                {booking.markedBooked
                                  ? "Marked booked by you"
                                  : "Still on your checklist"}
                              </Text>
                              {!!booking.notes && (
                                <Text style={[s.body, { fontSize: 13 }]}>
                                  {booking.notes}
                                </Text>
                              )}
                            </View>
                            <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${booking.title}`} onPress={()=>setPanel({type:'booking',booking})} hitSlop={9}>
                              <Ionicons name="create-outline" size={20} color={colors.green}/>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Delete ${booking.title}`}
                              onPress={() =>
                                update((prev) => ({
                                  ...prev,
                                  bookings: prev.bookings.filter(
                                    (b) => b.id !== booking.id,
                                  ),
                                }))
                              }
                            >
                              <Ionicons
                                name="trash-outline"
                                size={19}
                                color={colors.muted}
                              />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                      <Button
                        title={
                          state.remindersEnabled
                            ? "Refresh device reminders"
                            : "Enable device reminders"
                        }
                        variant="secondary"
                        icon="notifications-outline"
                        onPress={enableReminders}
                      />
                      <Text style={[s.body, { fontSize: 12 }]}>
                        Checklist entries are your notes, not confirmation from
                        an operator. Reminders run on your device and use Banff
                        time.
                      </Text>
                    </Card>
                  )}
                </View>
                <View>
                  <SectionTitle title="Pack a little peace of mind" />
                  <Card style={{ gap: 18 }}>
                    {packingItems.map((item) => (
                      <Pressable
                        key={item.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{
                          checked: state.checkedPackingIds.includes(item.id),
                        }}
                        aria-checked={state.checkedPackingIds.includes(item.id)}
                        onPress={() =>
                          update((prev) => ({
                            ...prev,
                            checkedPackingIds: prev.checkedPackingIds.includes(
                              item.id,
                            )
                              ? prev.checkedPackingIds.filter(
                                  (v) => v !== item.id,
                                )
                              : [...prev.checkedPackingIds, item.id],
                          }))
                        }
                        style={[s.row, { alignItems: "flex-start" }]}
                      >
                        <Ionicons
                          name={
                            state.checkedPackingIds.includes(item.id)
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={23}
                          color={colors.green}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.ink,
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={[
                              s.body,
                              { fontSize: 12, lineHeight: 19, marginTop: 4 },
                            ]}
                          >
                            {item.detail}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </Card>
                </View>
                <View style={s.wrap}>
                  <Button
                    title="Trip budget"
                    variant="secondary"
                    icon="wallet-outline"
                    onPress={() => setPanel({ type: "budget" })}
                  />
                  <Button
                    title="Save offline"
                    icon="cloud-download-outline"
                    onPress={() => setPanel({ type: "offline" })}
                  />
                </View>
              </>
            )}
            {tab === "Essentials" && (
              <>
                <ImageBackground
                  source={pictures.town}
                  imageStyle={{ borderRadius: 22 }}
                  style={{ height: 185 }}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(10,34,27,.9)"]}
                    style={[a.heroShade, { justifyContent: "flex-end" }]}
                  >
                    <Text
                      style={[a.heroTitle, { fontSize: 28, lineHeight: 33 }]}
                    >
                      Know a little more.\nEnjoy a lot more.
                    </Text>
                  </LinearGradient>
                </ImageBackground>
                <View style={[a.placeGrid, wide && a.twoCols]}>
                  {[
                    {
                      title: "Park-pass planner",
                      body: "Compare admission for your party and journey.",
                      icon: "ticket-outline" as const,
                      type: "pass" as const,
                    },
                    {
                      title: "Your trip budget",
                      body: "Keep your own CAD estimates in one place.",
                      icon: "wallet-outline" as const,
                      type: "budget" as const,
                    },
                    {
                      title: "Ready for offline",
                      body: "Keep your trip and guides within reach.",
                      icon: "cloud-download-outline" as const,
                      type: "offline" as const,
                    },
                    {
                      title: "Saved places",
                      body: "A little collection of your kind of Banff.",
                      icon: "bookmark-outline" as const,
                      type: "saved" as const,
                    },
                  ].map((item) => (
                    <Pressable
                      key={item.title}
                      accessibilityRole="button"
                      onPress={() => setPanel({ type: item.type })}
                      style={{ width: wide ? "48.8%" : "100%" }}
                    >
                      <Card style={{ height: 135, gap: 8 }}>
                        <Ionicons
                          name={item.icon}
                          size={23}
                          color={colors.green}
                        />
                        <Text style={s.h3}>{item.title}</Text>
                        <Text
                          style={[s.body, { fontSize: 13, lineHeight: 19 }]}
                        >
                          {item.body}
                        </Text>
                      </Card>
                    </Pressable>
                  ))}
                </View>
                <View>
                  <SectionTitle title="Good to know before you go" />
                  <Card>
                    {guides.map((guide, index) => (
                      <Pressable
                        key={guide.id}
                        accessibilityRole="button"
                        onPress={() => setPanel({ type: "guide", guide })}
                        style={[
                          a.guideRow,
                          index < guides.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.line,
                          },
                        ]}
                      >
                        <View style={a.roundIcon}>
                          <Ionicons
                            name="book-outline"
                            size={19}
                            color={colors.green}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "600",
                              color: colors.ink,
                            }}
                          >
                            {guide.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[s.body, { fontSize: 12 }]}
                          >
                            {guide.summary}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color={colors.muted}
                        />
                      </Pressable>
                    ))}
                  </Card>
                </View>
                <Card>
                  <SectionTitle title="Useful connections" />
                  {[
                    {
                      name: "Parks Canada visitor information",
                      url: "https://parks.canada.ca/pn-np/ab/banff",
                    },
                    {
                      name: "Roam public transit",
                      url: "https://roamtransit.com/",
                    },
                    {
                      name: "Road conditions · 511 Alberta",
                      url: "https://511.alberta.ca/",
                    },
                    {
                      name: "Official Banff weather · ECCC",
                      url: "https://weather.gc.ca/en/location/index.html?coords=51.18,-115.57",
                    },
                    {
                      name: "Town of Banff events",
                      url: "https://banff.ca/Calendar.aspx",
                    },
                  ].map((item) => (
                    <Pressable
                      accessibilityRole="link"
                      key={item.name}
                      onPress={() => openUrl(item.url)}
                      style={[
                        s.row,
                        {
                          justifyContent: "space-between",
                          paddingVertical: 13,
                        },
                      ]}
                    >
                      <Text style={[s.link, { flex: 1 }]}>{item.name}</Text>
                      <Ionicons
                        name="open-outline"
                        size={17}
                        color={colors.green}
                      />
                    </Pressable>
                  ))}
                </Card>
                <Notice icon="call-outline">
                  For an emergency, call 911 where a connection is available.
                  Mobile coverage is limited in parts of the park; prepare for
                  your actual outing.
                </Notice>
                <View style={s.wrap}>
                  <Button
                    title="Privacy & your data"
                    variant="ghost"
                    small
                    onPress={() => setPanel({ type: "privacy" })}
                  />
                  <Button
                    title="About BanffBound"
                    variant="ghost"
                    small
                    onPress={() => setPanel({ type: "about" })}
                  />
                  <Button
                    title="Import a saved trip"
                    variant="ghost"
                    small
                    onPress={() => setPanel({ type: "import" })}
                  />
                </View>
                <Text style={[s.body, { textAlign: "center", fontSize: 11 }]}>
                  BanffBound 1.0 · Content {dataVersion}
                </Text>
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
          {!wide && (
            <SafeAreaView edges={["bottom"]} style={a.bottomBar}>
              <View style={{ flexDirection: "row" }}>
                {(Object.keys(tabIcons) as Tab[]).map((name) => (
                  <Pressable
                    key={name}
                    accessibilityRole="tab"
                    accessibilityLabel={name}
                    aria-selected={tab === name}
                accessibilityState={{ selected: tab === name }}
                    onPress={() => navigate(name)}
                    style={a.bottomItem}
                  >
                    <View
                      style={[
                        a.tabIcon,
                        tab === name && { backgroundColor: colors.pale },
                      ]}
                    >
                      <Ionicons
                        name={tabIcons[name]}
                        size={23}
                        color={tab === name ? colors.pine : colors.muted}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: tab === name ? "700" : "400",
                        color: tab === name ? colors.pine : colors.muted,
                        marginTop: 3,
                      }}
                    >
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </SafeAreaView>
          )}
        </View>
      </View>
      {!!toast && (
        <Pressable
          accessibilityRole="alert"
          onPress={() => setToast("")}
          style={a.toast}
        >
          <Text style={{ color: colors.white, lineHeight: 21, fontSize: 14 }}>
            {toast}
          </Text>
        </Pressable>
      )}
      {panel && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setPanel(null)}
        >
          <View style={a.modalBackdrop}>
            <View style={[a.modal, wide && { maxWidth: 650 }]}>
              <SafeAreaView
                edges={["top", "bottom"]}
                style={{ maxHeight: "100%" }}
              >
                <View style={a.modalHeader}>
                  <Text style={s.eyebrow}>BANFFBOUND · MADE FOR YOUR TRIP</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close panel"
                    onPress={() => setPanel(null)}
                    style={a.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.pine} />
                  </Pressable>
                </View>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={a.modalContent}
                >
                  {panel.type === "place" && (
                    <>
                      <Image
                        source={picture(panel.place)}
                        style={a.detailImage}
                      />
                      <Text style={s.eyebrow}>
                        {categoryNames[panel.place.category].toUpperCase()} ·{" "}
                        {baseNames[panel.place.area].toUpperCase()}
                      </Text>
                      <Text style={s.h1}>{panel.place.name}</Text>
                      <Text style={s.body}>{panel.place.description}</Text>
                      <View style={s.wrap}>
                        <Chip
                          label={
                            state.savedPlaceIds.includes(panel.place.id)
                              ? "Saved to your places"
                              : "Save this place"
                          }
                          icon={
                            state.savedPlaceIds.includes(panel.place.id)
                              ? "bookmark"
                              : "bookmark-outline"
                          }
                          selected={state.savedPlaceIds.includes(
                            panel.place.id,
                          )}
                          onPress={() => toggleSave(panel.place.id)}
                        />
                        {panel.place.durationHours && (
                          <View style={a.metaPill}>
                            <Ionicons
                              name="time-outline"
                              size={15}
                              color={colors.green}
                            />
                            <Text style={s.link}>
                              Allow {panel.place.durationHours}h
                            </Text>
                          </View>
                        )}
                      </View>
                      {panel.place.bookingRequired && (
                        <Notice icon="ticket-outline">
                          Check whether a reservation is required for your date
                          and chosen service.
                        </Notice>
                      )}
                      {panel.place.tips.map((tip, i) => (
                        <Text key={i} style={s.body}>
                          • {tip}
                        </Text>
                      ))}
                      {panel.place.plannerActivityId && (
                        <View>
                          <Text style={[s.h3, { marginBottom: 12 }]}>
                            Add an outing to your trip
                          </Text>
                          {activityFitsSeason(
                            activityById[panel.place.plannerActivityId],
                            state.trip.season,
                          ) ? (
                            <View style={s.wrap}>
                              {state.trip.days.map((day, i) => (
                                <Chip
                                  key={i}
                                  label={`Day ${i + 1}${day.includes(panel.place.plannerActivityId!) ? " · added" : ""}`}
                                  selected={day.includes(
                                    panel.place.plannerActivityId!,
                                  )}
                                  onPress={() => {
                                    if (
                                      day.length >= 3 &&
                                      !day.includes(
                                        panel.place.plannerActivityId!,
                                      )
                                    ) {
                                      setToast(
                                        "That day has three outings. Remove one first.",
                                      );
                                      return;
                                    }
                                    update((prev) =>
                                      addPlaceToDay(prev, i, panel.place.id),
                                    );
                                    setToast(
                                      `${panel.place.name} selected for day ${i + 1}.`,
                                    );
                                  }}
                                />
                              ))}
                            </View>
                          ) : (
                            <Notice>
                              This outing is for{" "}
                              {
                                activityById[panel.place.plannerActivityId]
                                  .season
                              }
                              . Change your trip season to include it.
                            </Notice>
                          )}
                        </View>
                      )}
                      {panel.place.offlineGuideId &&
                        guides.find(
                          (g) => g.id === panel.place.offlineGuideId,
                        ) && (
                          <Button
                            title="Read the offline guide"
                            variant="secondary"
                            icon="book-outline"
                            onPress={() =>
                              setPanel({
                                type: "guide",
                                guide: guides.find(
                                  (g) => g.id === panel.place.offlineGuideId,
                                )!,
                              })
                            }
                          />
                        )}
                      <Button
                        title="Read the BanffBound guide"
                        icon="open-outline"
                        variant="secondary"
                        onPress={() => openUrl(panel.place.guideUrl)}
                      />
                      <Button
                        title="Check the official source"
                        icon="open-outline"
                        variant="ghost"
                        onPress={() => openUrl(panel.place.sourceUrl)}
                      />
                      {panel.place.coordinateStatus === "verified" && (
                        <Button
                          title="Show on map"
                          icon="map-outline"
                          variant="ghost"
                          onPress={() => {
                            setSelectedPlace(panel.place);
                            navigate("Map");
                          }}
                        />
                      )}
                      <Text style={[s.body, { fontSize: 11 }]}>
                        Reviewed {panel.place.reviewedAt}. Scenic editorial
                        illustration of the area; not a location-specific
                        photograph. {panel.place.coordinateNote || ""}
                      </Text>
                    </>
                  )}
                  {panel.type === "guide" && (
                    <>
                      <Text style={s.eyebrow}>THE OFFLINE FIELD NOTES</Text>
                      <Text style={s.h1}>{panel.guide.title}</Text>
                      <Text style={s.body}>{panel.guide.summary}</Text>
                      {panel.guide.sections.map((section, index) => (
                        <View key={index} style={{ gap: 9 }}>
                          <Text style={s.h2}>{section.title}</Text>
                          <Text style={s.body}>{section.body}</Text>
                        </View>
                      ))}
                      <Button
                        title="Check the official source"
                        variant="secondary"
                        icon="open-outline"
                        onPress={() => openUrl(panel.guide.sourceUrl)}
                      />
                      <Text style={[s.body, { fontSize: 11 }]}>
                        Reviewed {panel.guide.reviewedAt}. Saved guidance is not
                        a current conditions report.
                      </Text>
                    </>
                  )}
                  {panel.type === "activity-detail" && (
                    <>
                      <Text style={s.eyebrow}>YOUR ITINERARY IDEA</Text>
                      <Text style={s.h1}>
                        {activityById[panel.activityId].name}
                      </Text>
                      <Text style={s.body}>
                        {activityById[panel.activityId].description}
                      </Text>
                      <Notice>
                        Allow {activityById[panel.activityId].hours} hours for
                        the activity, plus travel and breaks. Check operations
                        and return arrangements for your date.
                      </Notice>
                      <Button
                        title="Read the BanffBound guide"
                        variant="secondary"
                        icon="book-outline"
                        onPress={() =>
                          openUrl(
                            `https://banffbound.com${activityById[panel.activityId].guide}`,
                          )
                        }
                      />
                      <Button
                        title="Check the official source"
                        variant="ghost"
                        icon="open-outline"
                        onPress={() =>
                          openUrl(activityById[panel.activityId].source)
                        }
                      />
                      {places.some(
                        (p) => p.plannerActivityId === panel.activityId,
                      ) && (
                        <>
                          <Text style={s.h2}>
                            Explore places for this outing
                          </Text>
                          {places
                            .filter(
                              (p) => p.plannerActivityId === panel.activityId,
                            )
                            .map((place) => (
                              <Button
                                key={place.id}
                                title={place.name}
                                variant="secondary"
                                onPress={() =>
                                  setPanel({ type: "place", place })
                                }
                              />
                            ))}
                        </>
                      )}
                    </>
                  )}
                  {panel.type === "settings" && (
                    <TripSettings
                      state={state}
                      update={update}
                      done={() => {
                        setPanel(null);
                        setToast("Trip details saved on this device.");
                      }}
                    />
                  )}
                  {panel.type === "templates" && (
                    <>
                      <Text style={s.h1}>A starting point for good days.</Text>
                      <Text style={s.body}>
                        Choose a reviewed itinerary, then make it yours.
                        Applying an idea replaces your day-by-day outings; your
                        bookings and saved places stay here.
                      </Text>
                      {plannerTemplates
                        .filter((t) => plannerTemplatesForApp.includes(t.id))
                        .map((template) => (
                          <Card key={template.id} style={{ gap: 12 }}>
                            <Text style={s.eyebrow}>
                              {template.season.toUpperCase()} ·{" "}
                              {template.days.length} DAYS
                            </Text>
                            <Text style={s.h2}>{template.name}</Text>
                            <Text style={s.body}>{template.description}</Text>
                            <Button
                              title="Use this itinerary"
                              variant="secondary"
                              onPress={() => {
                                update((prev) => ({
                                  ...prev,
                                  trip: applyTemplate(prev.trip, template.id),
                                  dayPlaces: {},
                                }));
                                navigate("My Trip");
                                setToast(
                                  "Itinerary added. Check the days against your dates and transport.",
                                );
                              }}
                            />
                          </Card>
                        ))}
                    </>
                  )}
                  {panel.type === "activities" && (
                    <>
                      <Text style={s.h1}>Make room for something good.</Text>
                      <Text style={s.body}>
                        Add an outing to day {panel.day + 1}. Allow extra time
                        for transfers and breaks.
                      </Text>
                      {plannerActivities
                        .filter(
                          (p) =>
                            activityFitsSeason(p, state.trip.season) &&
                            !state.trip.days[panel.day].includes(p.id),
                        )
                        .map((activity) => (
                          <Card key={activity.id} style={{ gap: 10 }}>
                            <Text style={s.h3}>
                              {activity.icon} {activity.name}
                            </Text>
                            <Text style={s.body}>{activity.description}</Text>
                            <Text style={s.eyebrow}>
                              {baseNames[activity.area].toUpperCase()} · ALLOW{" "}
                              {activity.hours}H
                            </Text>
                            <Button
                              title="Add to this day"
                              variant="secondary"
                              small
                              onPress={() => {
                                update((prev) => ({
                                  ...prev,
                                  trip: addActivity(
                                    prev.trip,
                                    panel.day,
                                    activity.id,
                                  ),
                                }));
                                setPanel(null);
                              }}
                            />
                          </Card>
                        ))}
                    </>
                  )}
                  {panel.type === "budget" && (
                    <BudgetPanel state={state} update={update} />
                  )}
                  {panel.type === "pass" && <PassPanel state={state} />}
                  {panel.type === "booking" && (
                    <BookingPanel
                      state={state}
                      booking={panel.booking}
                      onSave={(booking) => {
                        update((prev) => ({
                          ...prev,
                          bookings: prev.bookings.some(b=>b.id===booking.id)?prev.bookings.map(b=>b.id===booking.id?booking:b):[...prev.bookings, booking],
                        }));
                        setPanel(null);
                        setToast(
                          "Booking task saved. Confirm the actual reservation with your operator.",
                        );
                      }}
                    />
                  )}
                  {panel.type === "offline" && (
                    <>
                      <View style={a.roundIcon}>
                        <Ionicons
                          name="cloud-download-outline"
                          size={27}
                          color={colors.green}
                        />
                      </View>
                      <Text style={s.h1}>
                        A little less signal. A little more freedom.
                      </Text>
                      <Text style={s.body}>
                        Your app includes {guides.length} guides and{" "}
                        {places.length} place summaries. Save your personal trip
                        before you head out, then reopen it without a
                        connection.
                      </Text>
                      <Card style={{ gap: 13 }}>
                        {[
                          "Your editable itinerary and saved places",
                          "Original guides and practical planning notes",
                          "Your packing list, budget and booking notes",
                        ].map((t) => (
                          <View key={t} style={s.row}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={colors.green}
                            />
                            <Text style={[s.body, { flex: 1 }]}>{t}</Text>
                          </View>
                        ))}
                      </Card>
                      <Notice>
                        Online maps, directions, current reports, external
                        guides and booking websites need a connection. Offline
                        content does not confirm that a route or service is
                        operating.
                      </Notice>
                      {state.downloadedAt && (
                        <Text style={s.body}>
                          Last saved{" "}
                          {new Date(state.downloadedAt).toLocaleString()}. Save
                          again after changing your trip.
                        </Text>
                      )}
                      <Button
                        title={
                          busy ? "Saving your trip…" : "Save trip for offline"
                        }
                        icon="download-outline"
                        onPress={download}
                        disabled={busy}
                      />
                      <Button
                        title="Share a trip summary"
                        variant="secondary"
                        icon="share-outline"
                        onPress={() =>
                          void shareTrip(state).catch((e) =>
                            setToast(e.message),
                          )
                        }
                      />
                      <Button
                        title="Export trip JSON (notes excluded)"
                        variant="ghost"
                        icon="document-text-outline"
                        onPress={() =>
                          void shareTripPack(state).catch((e) =>
                            setToast(e.message),
                          )
                        }
                      />
                      <Text style={[s.body, { fontSize: 12 }]}>
                        Private booking notes stay out of shared summaries.
                        Browser storage can be removed by your browser; keep an
                        exported copy of important arrangements.
                      </Text>
                    </>
                  )}
                  {panel.type === "saved" && (
                    <>
                      <Text style={s.h1}>Your little collection.</Text>
                      {state.savedPlaceIds.length ? (
                        <View style={{ gap: 15 }}>
                          {places
                            .filter((p) => state.savedPlaceIds.includes(p.id))
                            .map((place) => (
                              <PlaceCard
                                key={place.id}
                                place={place}
                                saved
                                onSave={() => toggleSave(place.id)}
                                onPress={() =>
                                  setPanel({ type: "place", place })
                                }
                              />
                            ))}
                        </View>
                      ) : (
                        <Empty
                          icon="bookmark-outline"
                          title="Keep what catches your eye"
                          body="Tap the bookmark on a place to keep it here."
                          action="Find a favourite"
                          onPress={() => navigate("Explore")}
                        />
                      )}
                    </>
                  )}
                  {panel.type === "privacy" && (
                    <PrivacyPanel
                      onReset={() => setPanel({ type: "reset" })}
                      onDisableReminders={async () => {
                        update((prev) => ({
                          ...prev,
                          remindersEnabled: false,
                        }));
                        await syncBookingReminders([], false);
                        setToast("Device reminders switched off.");
                      }}
                    />
                  )}
                  {panel.type === "reset" && (
                    <>
                      <Text style={s.h1}>Clear this device's trip?</Text>
                      <Text style={s.body}>
                        This removes your itinerary, booking notes, saved
                        places, packing selections, budget and offline trip file
                        from this device. It does not cancel bookings with
                        operators.
                      </Text>
                      <Button
                        title="Keep my trip"
                        onPress={() => setPanel(null)}
                      />
                      <Button
                        title="Clear my trip and notes"
                        variant="danger"
                        onPress={async () => {
                          try {
                            await syncBookingReminders([], false);
                            await clearOfflinePack();
                            await reset();
                            setPanel(null);
                            setToast(
                              "Your trip and notes have been cleared from this device.",
                            );
                          } catch {
                            setToast(
                              "Some data could not be cleared. Please try again.",
                            );
                          }
                        }}
                      />
                    </>
                  )}
                  {panel.type === "import" && (
                    <ImportPanel
                      onImport={(next) => {
                        update(() => next);
                        navigate("My Trip");
                        setToast("Trip imported on this device.");
                      }}
                    />
                  )}
                  {panel.type === "about" && (
                    <>
                      <Text style={s.eyebrow}>BANFFBOUND</Text>
                      <Text style={s.h1}>For the days you'll remember.</Text>
                      <Text style={s.body}>
                        An independent trip companion for Banff, Lake Louise and
                        Canmore. We bring the practical details together so you
                        can make more of your time in the mountains.
                      </Text>
                      <Text style={s.body}>
                        BanffBound is independent of Parks Canada, transit
                        providers and activity operators. Official conditions
                        and operator terms remain the source for current access
                        and reservations.
                      </Text>
                      <Button
                        title="Visit BanffBound"
                        variant="secondary"
                        onPress={() => openUrl("https://banffbound.com")}
                      />
                      <Button
                        title="Get help or suggest a correction"
                        variant="ghost"
                        onPress={() =>
                          openUrl("https://banffbound.com/contact")
                        }
                      />
                      <Text style={s.h3}>Images & sources</Text>
                      <Text style={s.body}>
                        Bundled scenic images are reused from the BanffBound
                        editorial library and illustrate the area. Place records
                        link to their reviewed information sources. Some images
                        are illustrative rather than a precise view of the
                        selected place.
                      </Text>
                      <Text style={[s.body, { fontSize: 11 }]}>
                        Version 1.0.0 · {dataVersion}
                      </Text>
                    </>
                  )}
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function WeatherCard({ area }: { area: WeatherArea }) {
  const [weather, setWeather] = useState<MobileWeather>(() =>
    unavailableMobileWeather(area),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const refresh = async () => {
    setRefreshing(true);
    const next = await fetchEcccWeather(area);
    setWeather(next);
    setTick(Date.now());
    setRefreshing(false);
  };
  useEffect(() => {
    let active = true;
    setWeather(unavailableMobileWeather(area));
    setRefreshing(true);
    void fetchEcccWeather(area).then((next) => {
      if (active) {
        setWeather(next);
        setRefreshing(false);
        setTick(Date.now());
      }
    });
    const timer = setInterval(() => {
      if (active) {
        setTick(Date.now());
        void fetchEcccWeather(area).then((next) => {
          if (active) setWeather(next);
        });
      }
    }, 15 * 60000);
    const expiryTimer=setInterval(()=>{if(active)setTick(Date.now());},60000);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(expiryTimer);
    };
  }, [area]);
  const current =
    weather.available &&
    weather.observedAt &&
    tick - Date.parse(weather.observedAt) <= WEATHER_MAX_AGE_MS;
  return (
    <Card>
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>
            A LOOK OUTSIDE · {baseNames[area].toUpperCase()}
          </Text>
          <Text style={[s.h2, { marginTop: 8 }]}>
            {current
              ? `${weather.temperature?.toFixed(1)}°C · ${weather.condition}`
              : refreshing
                ? "Checking the official observation…"
                : "Check the weather before you go"}
          </Text>
          <Text style={[s.body, { fontSize: 12, marginTop: 6 }]}>
            {current
              ? `${weather.station} · observed ${formatBanffDateTime(new Date(weather.observedAt!), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} Banff time`
              : "An observation is unavailable here. Open the official report for the latest information."}
          </Text>
        </View>
        <Ionicons name="partly-sunny-outline" size={30} color={colors.gold} />
      </View>
      <View style={[s.wrap, { marginTop: 15 }]}>
        <Button
          title="Official weather"
          variant="secondary"
          small
          icon="open-outline"
          onPress={() => openUrl(weather.sourceUrl)}
        />
        <Button
          title={refreshing ? "Checking…" : "Refresh"}
          variant="ghost"
          small
          onPress={refresh}
          disabled={refreshing}
        />
      </View>
      <Text style={[s.body, { fontSize: 10, marginTop: 12 }]}>
        Environment and Climate Change Canada · observations expire after three
        hours. Conditions can differ at elevation.
      </Text>
    </Card>
  );
}
function ActivityRow({
  id,
  index,
  onPress,
  placeId,
}: {
  id: string;
  index: number;
  onPress: () => void;
  placeId?: string;
}) {
  const activity = activityById[id];
  const place = places.find((p) => p.id === placeId);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.row, { alignItems: "flex-start", paddingVertical: 10 }]}
    >
      <View style={a.activityIndex}>
        <Text style={{ color: colors.green, fontSize: 12, fontWeight: "700" }}>
          {String(index + 1).padStart(2, "0")}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.ink,
            fontSize: 15,
            fontWeight: "600",
            lineHeight: 22,
          }}
        >
          {place?.name || activity.name}
        </Text>
        <Text style={[s.body, { fontSize: 12 }]}>
          {baseNames[place?.area || activity.area]} · Allow {activity.hours}h
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </Pressable>
  );
}
function PlaceCard({
  place,
  saved,
  onSave,
  onPress,
  wide = false,
  mapAction,
}: {
  place: Place;
  saved: boolean;
  onSave: () => void;
  onPress: () => void;
  wide?: boolean;
  mapAction?: () => void;
}) {
  return (
    <View style={[a.placeCard, wide && { width: "48.8%" }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${place.name}`}
        onPress={onPress}
      >
        <Image source={picture(place)} style={a.placeImage} />
        <View style={a.placeBody}>
          <Text style={s.eyebrow}>
            {baseNames[place.area].toUpperCase()} ·{" "}
            {categoryNames[place.category].toUpperCase()}
          </Text>
          <Text style={[s.h2, { fontSize: 22, lineHeight: 27, marginTop: 8 }]}>
            {place.name}
          </Text>
          <Text
            numberOfLines={2}
            style={[s.body, { fontSize: 13, lineHeight: 20, marginTop: 8 }]}
          >
            {place.description}
          </Text>
          <View
            style={[s.row, { justifyContent: "space-between", marginTop: 13 }]}
          >
            <Text style={[s.body, { fontSize: 11 }]}>
              {place.season === "all"
                ? "Across the seasons"
                : place.season === "winter"
                  ? "Winter idea"
                  : "Summer idea"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.green} />
          </View>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${saved ? "Unsave" : "Save"} ${place.name}`}
        onPress={onSave}
        style={a.bookmark}
      >
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={20}
          color={colors.pine}
        />
      </Pressable>
      {mapAction && (
        <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
          <Button
            title="Focus on map"
            icon="locate-outline"
            small
            variant="secondary"
            onPress={mapAction}
          />
        </View>
      )}
    </View>
  );
}

type Update = (fn: (previous: AppState) => AppState) => void;
function TripSettings({
  state,
  update,
  done,
}: {
  state: AppState;
  update: Update;
  done: () => void;
}) {
  const [start, setStart] = useState(state.startDate);
  const [adults, setAdults] = useState(String(state.party.adults));
  const [children, setChildren] = useState(String(state.party.children));
  const [base, setBase] = useState(state.trip.base);
  const [season, setSeason] = useState(state.trip.season);
  const [transport, setTransport] = useState(state.trip.transport);
  const [error, setError] = useState("");
  return (
    <>
      <Text style={s.h1}>Make yourself at home.</Text>
      <Text style={s.body}>
        A few details help your itinerary fit the way you travel. Everything
        stays on this device.
      </Text>
      <Field
        label="First day · YYYY-MM-DD"
        value={start}
        onChangeText={setStart}
      />
      <Text style={s.h3}>Where are you staying?</Text>
      <View style={s.wrap}>
        {(["banff", "louise", "canmore"] as const).map((v) => (
          <Chip
            key={v}
            label={baseNames[v]}
            selected={base === v}
            onPress={() => setBase(v)}
          />
        ))}
      </View>
      <Text style={s.h3}>Getting around</Text>
      <View style={s.wrap}>
        <Chip
          label="Car-free"
          icon="bus-outline"
          selected={transport === "car-free"}
          onPress={() => setTransport("car-free")}
        />
        <Chip
          label="With a car"
          icon="car-outline"
          selected={transport === "drive"}
          onPress={() => setTransport("drive")}
        />
      </View>
      <Text style={s.h3}>Your season</Text>
      <View style={s.wrap}>
        <Chip
          label="Winter"
          icon="snow-outline"
          selected={season === "winter"}
          onPress={() => setSeason("winter")}
        />
        <Chip
          label="Summer"
          icon="sunny-outline"
          selected={season === "summer"}
          onPress={() => setSeason("summer")}
        />
      </View>
      {season !== state.trip.season && (
        <Notice>
          Changing season removes outings that do not fit. Opening dates and
          mountain conditions still need checking.
        </Notice>
      )}
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Field
            label="Adults"
            value={adults}
            onChangeText={setAdults}
            numeric
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Children"
            value={children}
            onChangeText={setChildren}
            numeric
          />
        </View>
      </View>
      {!!error && <Notice icon="warning-outline">{error}</Notice>}
      <Button
        title="Save trip details"
        onPress={() => {
          if (
            !isValidDate(start) ||
            !/^\d+$/.test(adults) ||
            !/^\d+$/.test(children) ||
            Number(adults) < 1 ||
            Number(adults) > 30 ||
            Number(children) > 30
          ) {
            setError("Enter a valid date, 1–30 adults and 0–30 children.");
            return;
          }
          update((prev) => ({
            ...prev,
            startDate: start,
            party: { adults: Number(adults), children: Number(children) },
            trip: { ...changeSeason(prev.trip, season), base, transport },
          }));
          done();
        }}
      />
    </>
  );
}
function BudgetPanel({ state, update }: { state: AppState; update: Update }) {
  const [values, setValues] = useState(
    Object.fromEntries(
      Object.entries(state.budget).map(([k, v]) => [
        k,
        v === null ? "" : String(v),
      ]),
    ),
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const labels: Record<keyof Budget, string> = {
    accommodation: "Accommodation",
    transport: "Transport, shuttles & parking",
    activities: "Activities & equipment",
    food: "Food & drinks",
    admission: "Park admission & permits",
    arrival: "Getting here & home",
    other: "Other trip costs",
  };
  const known = Object.values(values)
    .filter((v) => v.trim())
    .reduce((total, v) => total + (Number(v) || 0), 0);
  const missing = Object.values(values).filter((v) => !v.trim()).length;
  return (
    <>
      <Text style={s.h1}>A budget that fits your trip.</Text>
      <Text style={s.body}>
        Enter whole-trip amounts for your entire party in Canadian dollars. Use
        your own quotes, including taxes and required fees.
      </Text>
      <Card style={{ gap: 8 }}>
        <Text style={s.eyebrow}>
          {missing ? "ENTERED SUBTOTAL" : "YOUR ENTERED TOTAL"} · CAD
        </Text>
        <Text style={s.h1}>
          $
          {known.toLocaleString("en-CA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={s.body}>
          {missing
            ? `${missing} categories still blank. This is a partial estimate.`
            : `For ${state.party.adults + state.party.children} travellers across ${state.trip.days.length} days.`}
        </Text>
      </Card>
      {(Object.keys(labels) as (keyof Budget)[]).map((key) => (
        <Field
          key={key}
          label={`${labels[key]} · CAD`}
          value={values[key]}
          onChangeText={(v) => {
            setValues((prev) => ({ ...prev, [key]: v }));
            setSaved(false);
          }}
          placeholder="Amount unknown"
          numeric
        />
      ))}
      <Notice>
        Blank amounts are unknown. Admission, shuttles, parking and activity
        tickets are separate costs; avoid counting a package inclusion twice.
      </Notice>
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button
        title={saved ? "Budget saved" : "Save entered amounts"}
        onPress={() => {
          if (
            Object.values(values).some(
              (v) =>
                (v.trim() && !/^\d+(\.\d{1,2})?$/.test(v.trim())) ||
                Number(v) > 1e6,
            )
          ) {
            setError(
              "Use amounts from 0 to 1,000,000 CAD with at most two decimals.",
            );
            return;
          }
          update((prev) => ({
            ...prev,
            budget: Object.fromEntries(
              Object.entries(values).map(([k, v]) => [
                k,
                v.trim() === "" ? null : Number(v),
              ]),
            ) as Budget,
          }));
          setError("");
          setSaved(true);
        }}
      />
    </>
  );
}
function PassPanel({ state }: { state: AppState }) {
  const [input, setInput] = useState({
    ...defaultParkPassInputs,
    adults: String(state.party.adults),
    youth: String(state.party.children),
    units: String(state.trip.days.length),
    vehicle: state.trip.transport === "drive" ? "yes" : "no",
  });
  const result = calculateParkPassPlan(input);
  const set = (key: string, v: string) =>
    setInput((prev) => ({ ...prev, [key]: v }));
  return (
    <>
      <Text style={s.h1}>One less thing to wonder about.</Text>
      <Text style={s.body}>
        Compare park admission for your actual journey. Published rates reviewed{" "}
        {parkPassReviewedAt}; check the official seller for your dates.
      </Text>
      <Text style={s.h3}>What is your journey?</Text>
      <View style={{ gap: 8 }}>
        {parkPassOptions.purpose.map(([id, label]) => (
          <Chip
            key={id}
            label={label}
            selected={input.purpose === id}
            onPress={() => set("purpose", id)}
          />
        ))}
      </View>
      {result.showCoverage && (
        <>
          <Text style={s.h3}>What do you need?</Text>
          <View style={{ gap: 8 }}>
            {parkPassOptions.coverage.map(([id, label]) => (
              <Chip
                key={id}
                label={label}
                selected={input.coverage === id}
                onPress={() => set("coverage", id)}
              />
            ))}
          </View>
        </>
      )}
      {result.activePartyFields && (
        <>
          <View style={s.row}>
            {[
              ["adults", "Adults 18–64"],
              ["seniors", "Seniors 65+"],
              ["youth", "Youth 0–17"],
            ].map(([key, label]) => (
              <View key={key} style={{ flex: 1 }}>
                <Field
                  label={label}
                  value={input[key as keyof typeof input]}
                  onChangeText={(v) => set(key, v)}
                  numeric
                />
              </View>
            ))}
          </View>
          <Field
            label="Chargeable daily admission units"
            value={input.units}
            onChangeText={(v) => set("units", v)}
            numeric
          />
          <Text style={[s.body, { fontSize: 12 }]}>
            A unit is not automatically a calendar day. Confirm the admission
            period with the seller.
          </Text>
          <View style={{ gap: 8 }}>
            {parkPassOptions.vehicle.map(([id, label]) => (
              <Chip
                key={id}
                label={label}
                selected={input.vehicle === id}
                onPress={() => set("vehicle", id)}
              />
            ))}
          </View>
        </>
      )}
      {result.errors.map((e) => (
        <Notice key={e.field} icon="warning-outline">
          {e.message}
        </Notice>
      ))}
      <Card style={{ gap: 13 }}>
        <Text style={s.h3}>{result.summary}</Text>
        {result.rows.map((row) => (
          <View key={row.id} style={{ gap: 4 }}>
            <Text style={s.h3}>
              {row.label}
              {row.amountCents !== null
                ? ` · ${formatParkPassMoney(row.amountCents)}`
                : ""}
            </Text>
            <Text style={[s.body, { fontSize: 12 }]}>{row.detail}</Text>
          </View>
        ))}
        <Text style={s.body}>{result.detail}</Text>
      </Card>
      <Button
        title="Check official admission & fees"
        variant="secondary"
        icon="open-outline"
        onPress={() =>
          openUrl("https://parks.canada.ca/pn-np/ab/banff/visit/tarifs-fees")
        }
      />
    </>
  );
}
function BookingPanel({
  state,
  booking,
  onSave,
}: {
  state: AppState;
  booking?: Booking;
  onSave: (booking: Booking) => void;
}) {
  const [title, setTitle] = useState(booking?.title||"");
  const [date, setDate] = useState(booking?.date||state.startDate);
  const [time, setTime] = useState(booking?.time||"");
  const [notes, setNotes] = useState(booking?.notes||"");
  const [error, setError] = useState("");
  return (
    <>
      <Text style={s.h1}>Keep the little details.</Text>
      <Text style={s.body}>
        Add a reservation or a task to check. This does not make or verify a
        booking.
      </Text>
      <Field
        label="Booking or task"
        value={title}
        onChangeText={setTitle}
        placeholder="Shuttle, dinner, rental collection…"
      />
      <Field label="Date · YYYY-MM-DD" value={date} onChangeText={setDate} />
      <Field
        label="Time in Banff · HH:MM (optional)"
        value={time}
        onChangeText={setTime}
        placeholder="09:30"
      />
      <Notice>Booking times use Banff local time. From 1 November 2026, Alberta stays on UTC−6 year round.</Notice>
      <Button title="Alberta local-time information" variant="ghost" small icon="open-outline" onPress={()=>openUrl(BANFF_TIME_POLICY.sourceUrl)}/>
      <Field
        label="Private notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Meeting point, return plans, useful details…"
      />
      {!!error && <Notice icon="warning-outline">{error}</Notice>}
      <Button
        title={booking?"Save booking changes":"Add to my checklist"}
        onPress={() => {
          if (
            !title.trim() ||
            title.length > 120 ||
            !isValidDate(date) ||
            (time && !isValidTime(time)) ||
            notes.length > 2000
          ) {
            setError(
              "Add a title (up to 120 characters), valid date and 24-hour time if entered. Notes can be up to 2,000 characters.",
            );
            return;
          }
          onSave({
            id: booking?.id||newBookingId(),
            title: title.trim(),
            date,
            time,
            notes,
            markedBooked: booking?.markedBooked||false,
          });
        }}
      />
    </>
  );
}
function ImportPanel({ onImport }: { onImport: (state: AppState) => void }) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <Text style={s.h1}>Bring your saved trip.</Text>
      <Text style={s.body}>
        Paste a BanffBound trip-pack JSON export. Importing replaces your
        current trip, bookings and saved places on this device.
      </Text>
      <Button
        title="Choose a trip backup file"
        variant="secondary"
        icon="document-outline"
        onPress={async () => {
          try {
            const next = await pickTripPack();
            if (next) onImport(next);
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Unable to read that file.",
            );
          }
        }}
      />
      <Field
        label="Trip pack JSON"
        value={raw}
        onChangeText={setRaw}
        multiline
        placeholder='{"format":"banffbound-trip",…}'
      />
      {!!error && <Notice icon="warning-outline">{error}</Notice>}
      <Button
        title="Replace with this trip"
        onPress={() => {
          const next = importTripPack(raw);
          if (!next) {
            setError(
              "This is not a valid BanffBound trip pack. Check that you copied the complete JSON file.",
            );
            return;
          }
          onImport(next);
        }}
      />
    </>
  );
}
function PrivacyPanel({
  onReset,
  onDisableReminders,
}: {
  onReset: () => void;
  onDisableReminders: () => void;
}) {
  return (
    <>
      <Text style={s.h1}>Your trip belongs to you.</Text>
      <Text style={s.body}>
        Your itinerary, saved places, budget, packing selections and booking
        notes are stored on this device. This version has no BanffBound account,
        advertising SDK or behavioural analytics.
      </Text>
      <Text style={s.h2}>Permissions you choose</Text>
      <Text style={s.body}>
        Location is requested only when you tap Near me. It is used to sort
        places and is not uploaded to a BanffBound server. Device reminders
        require your notification permission. You can use the app without either
        permission.
      </Text>
      <Text style={s.h2}>When you go online</Text>
      <Text style={s.body}>
        Online maps load OpenStreetMap, official weather comes from Environment
        and Climate Change Canada, and external links open the chosen provider.
        Those services receive normal connection information and apply their own
        privacy policies. BanffBound hosting receives normal request logs when
        serving the web app and its assets.
      </Text>
      <Text style={s.h2}>Downloads and sharing</Text>
      <Text style={s.body}>
        Offline trip files stay on this device. Shared trip summaries omit
        private booking notes. Browser data can be removed by clearing site
        storage; uninstalling the app can remove app data. Keep operator
        confirmations separately.
      </Text>
      <Text style={s.h2}>Help and corrections</Text>
      <Text style={s.body}>
        Contact hello@banffbound.com through our website. This independent app
        is not operated by Parks Canada or transit and activity providers.
      </Text>
      <Button
        title="Contact BanffBound"
        variant="secondary"
        onPress={() => openUrl("https://banffbound.com/contact")}
      />
      <Button
        title="Turn off device reminders"
        variant="ghost"
        onPress={onDisableReminders}
      />
      <Button
        title="Clear my trip from this device"
        variant="danger"
        onPress={onReset}
      />
      <Text style={[s.body, { fontSize: 11 }]}>
        Privacy disclosure · 30 October 2026
      </Text>
    </>
  );
}

const a = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  shell: { flex: 1, width: "100%", maxWidth: 1500, alignSelf: "center" },
  wideShell: { flexDirection: "row" },
  sidebar: {
    width: 255,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    padding: 26,
    paddingTop: 37,
    backgroundColor: colors.white,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 35, height: 35, borderRadius: 9 },
  wordmark: { fontFamily: serif, fontSize: 23, color: colors.pine },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 12,
    marginBottom: 9,
  },
  main: { flex: 1, minWidth: 0 },
  header: {
    paddingHorizontal: 23,
    paddingTop: 22,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pageTitle: {
    fontFamily: serif,
    fontSize: 29,
    lineHeight: 36,
    color: colors.ink,
    marginTop: 7,
  },
  profile: {
    height: 44,
    width: 44,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  content: { paddingHorizontal: 22, paddingBottom: 22, gap: 27 },
  hero: { height: 350, overflow: "hidden", borderRadius: 23 },
  heroShade: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    borderRadius: 23,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  whitePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.5)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(20,50,40,.2)",
  },
  pillText: { color: colors.white, fontSize: 11 },
  heroBadge: {
    color: colors.white,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.7,
  },
  heroTitle: {
    fontFamily: serif,
    color: colors.white,
    fontSize: 34,
    lineHeight: 40,
  },
  heroSub: { color: "#e3e9dd", fontSize: 12, marginTop: 11, lineHeight: 19 },
  heroButton: {
    backgroundColor: colors.white,
    padding: 12,
    paddingHorizontal: 17,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    alignSelf: "flex-start",
    marginTop: 19,
  },
  quickRow: { flexDirection: "row", gap: 9, marginTop: -7 },
  quickItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    gap: 8,
  },
  quickText: { fontSize: 11, color: colors.ink, fontWeight: "500" },
  roundIcon: {
    height: 44,
    width: 44,
    borderRadius: 23,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndex: {
    height: 33,
    width: 33,
    borderRadius: 17,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  placeGrid: { gap: 17 },
  twoCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  placeCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    width: "100%",
  },
  placeImage: { width: "100%", height: 175 },
  placeBody: { padding: 18 },
  bookmark: {
    position: "absolute",
    top: 13,
    right: 13,
    backgroundColor: "rgba(255,255,255,.95)",
    width: 36,
    height: 36,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  pineCard: {
    backgroundColor: colors.pine,
    borderColor: colors.pine,
    padding: 23,
  },
  searchBox: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 15,
    outlineStyle: "none" as any,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 17,
  },
  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  bottomItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 9,
    minHeight: 67,
  },
  tabIcon: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 19 },
  toast: {
    position: "absolute",
    bottom: 90,
    left: 22,
    right: 22,
    alignSelf: "center",
    maxWidth: 650,
    backgroundColor: colors.pine,
    padding: 17,
    borderRadius: 14,
    boxShadow: "0px 4px 18px rgba(0,0,0,.15)",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9,27,21,.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 45,
  },
  modal: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: "100%",
    maxHeight: "96%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  closeButton: {
    height: 38,
    width: 38,
    borderRadius: 20,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: { padding: 24, paddingBottom: 40, gap: 22 },
  detailImage: { width: "100%", height: 210, borderRadius: 16 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.pale,
  },
});
