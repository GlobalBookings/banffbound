import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createSearchDebouncer, SEARCH_DEBOUNCE_MS } from '../lib/search';
import { colors } from './ui';

export type SearchInputHandle = { clear: () => void };
export type SearchInputProps = {
  onSearch: (query: string) => void;
  accessibilityLabel: string;
  testID?: string;
  placeholder?: string;
  initialQuery?: string;
  clearAccessibilityLabel?: string;
  debounceMs?: number;
  style?: StyleProp<ViewStyle>;
};

/** Keep each keystroke in this small component, away from map and directory rendering. */
const SearchInput = memo(forwardRef<SearchInputHandle, SearchInputProps>(function SearchInput({
  onSearch, accessibilityLabel, testID, placeholder, initialQuery = '',
  clearAccessibilityLabel = 'Clear search', debounceMs = SEARCH_DEBOUNCE_MS, style,
}, ref) {
  const [text, setText] = useState(() => initialQuery);
  const input = useRef<TextInput>(null);
  const latestOnSearch = useRef(onSearch);
  latestOnSearch.current = onSearch;
  const search = useMemo(() => createSearchDebouncer(query => latestOnSearch.current(query), debounceMs), [debounceMs]);
  // Cancel rather than dispose so React's development effect replay can safely reuse this controller.
  useEffect(() => () => search.cancel(), [search]);
  const clear = useCallback(() => {
    input.current?.clear();
    setText('');
    search.clear();
  }, [search]);
  useImperativeHandle(ref, () => ({ clear }), [clear]);
  return <View style={[styles.search, style]}>
    <Ionicons name="search-outline" size={20} color={colors.muted} />
    <TextInput
      ref={input}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      value={text}
      onChangeText={query => { setText(query); search.schedule(query); }}
      onSubmitEditing={event => {
        const query = event.nativeEvent.text;
        setText(query);
        search.flush(query);
      }}
      returnKeyType="search"
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize="none"
      maxLength={180}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      style={styles.input}
    />
    <View style={styles.clearSlot}>{!!text && <Pressable accessibilityRole="button" accessibilityLabel={clearAccessibilityLabel} onPress={clear} style={styles.clearButton}><Ionicons name="close-circle" size={21} color={colors.muted} /></Pressable>}</View>
  </View>;
}));

export default SearchInput;

const styles = StyleSheet.create({
  search: { minHeight: 54, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14 },
  input: { minWidth: 0, flex: 1, paddingVertical: 14, fontSize: 15, color: colors.ink },
  clearSlot: { width: 44, height: 44 },
  clearButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
