import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export const colors = {
  pine: "#163b31",
  green: "#286454",
  gold: "#c3a56b",
  cream: "#f8f7f2",
  white: "#fff",
  ink: "#20342d",
  muted: "#718079",
  line: "#e4e7df",
  pale: "#eaf0e8",
  orange: "#956221",
  danger: "#ac433b",
};
export const serif = "Georgia";
export const baseNames = {
  banff: "Banff",
  louise: "Lake Louise",
  canmore: "Canmore",
  regional: "Canadian Rockies",
};
export const categoryNames: Record<string, string> = {
  all: "Everything",
  lakes: "Lakes",
  walks: "Walks & hikes",
  attractions: "Things to do",
  food: "Eat & drink",
  stays: "Places to stay",
  winter: "Winter",
  essentials: "Essentials",
};
export const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  all: "compass-outline",
  lakes: "water-outline",
  walks: "trail-sign-outline",
  attractions: "sunny-outline",
  food: "restaurant-outline",
  stays: "bed-outline",
  winter: "snow-outline",
  essentials: "information-circle-outline",
};
type Icon = keyof typeof Ionicons.glyphMap;

export function Button({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  icon?: Icon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        small && s.small,
        variant === "secondary" && s.secondary,
        variant === "ghost" && s.ghost,
        variant === "danger" && s.danger,
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.4 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={small ? 16 : 19}
          color={
            variant === "primary" || variant === "danger"
              ? colors.white
              : colors.pine
          }
        />
      )}
      <Text
        style={[
          s.buttonText,
          (variant === "secondary" || variant === "ghost") && {
            color: colors.pine,
          },
          small && { fontSize: 13 },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: Icon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-selected={!!selected}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[s.chip, selected && s.selectedChip]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? colors.white : colors.pine}
        />
      )}
      <Text style={[s.chipText, selected && { color: colors.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.h2}>{title}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
          <Text style={s.link}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Notice({
  children,
  icon = "information-circle-outline",
}: {
  children: React.ReactNode;
  icon?: Icon;
}) {
  return (
    <View style={s.notice}>
      <Ionicons name={icon} color={colors.green} size={19} />
      <Text style={s.noticeText}>{children}</Text>
    </View>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={numeric ? "decimal-pad" : "default"}
        style={[
          s.input,
          multiline && { minHeight: 90, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Empty({
  icon = "compass-outline",
  title,
  body,
  action,
  onPress,
}: {
  icon?: Icon;
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Card style={{ alignItems: "center", gap: 14, paddingVertical: 32 }}>
      <Ionicons name={icon} size={34} color={colors.green} />
      <Text style={[s.h2, { textAlign: "center" }]}>{title}</Text>
      <Text style={[s.body, { textAlign: "center" }]}>{body}</Text>
      {action && onPress && <Button title={action} onPress={onPress} />}
    </Card>
  );
}
export function Loading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
      }}
    >
      <ActivityIndicator color={colors.pine} />
      <Text style={s.body}>Opening your Banff trip…</Text>
    </View>
  );
}
export const s = StyleSheet.create({
  h1: {
    fontFamily: serif,
    fontSize: 35,
    lineHeight: 41,
    color: colors.ink,
    fontWeight: "500",
  },
  h2: {
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 29,
    color: colors.ink,
    fontWeight: "500",
  },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: "600", color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "700",
    color: colors.green,
  },
  label: { fontSize: 12, fontWeight: "600", color: colors.ink },
  link: { fontSize: 13, color: colors.green, fontWeight: "600" },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stack: { gap: 18 },
  button: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 19,
    backgroundColor: colors.pine,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  small: { minHeight: 38, paddingHorizontal: 13, paddingVertical: 9 },
  secondary: { backgroundColor: colors.pale },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: { backgroundColor: colors.danger },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  chip: {
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  selectedChip: { backgroundColor: colors.pine, borderColor: colors.pine },
  chipText: { fontSize: 12, fontWeight: "500", color: colors.ink },
  notice: {
    backgroundColor: colors.pale,
    borderRadius: 13,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.green },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    padding: 13,
    fontSize: 15,
    color: colors.ink,
    minHeight: 48,
  },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 15 },
});
