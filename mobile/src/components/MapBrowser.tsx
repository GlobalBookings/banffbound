import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapSurface from './MapSurface';
import SearchInput, { type SearchInputHandle } from './SearchInput';
import { leafletLicense } from '../lib/vendor/leaflet-license';
import { mapCategories, type MapArea, type MapCategory, type MapPoint } from '../data/map';
import { mapPoints, mapDataVersion } from '../data/map.generated';
import { commerceItems } from '../data/commerce';
import { AffiliateButtons, RelatedCommerceLinks } from './CommerceBrowser';
import { Button, Card, Empty, Notice, baseNames, colors, s } from './ui';
import { filterMapPoints, mapCategoryCounts, mapDistanceKm, mapLocationUrl, safeMapExternalUrl } from '../lib/map';

type Props = { onOpenUrl: (url: string) => void; onOpenCommerceUrl: (url: string) => void; focusPlaceId?: string | null; position: { latitude: number; longitude: number } | null; onLocate: () => void; locationMessage: string };
const PAGE = 18;
const category = (id: MapCategory) => mapCategories.find(c => c.id === id)!;
const icon = (id: MapCategory) => category(id).icon as keyof typeof Ionicons.glyphMap;
type MapIcon = keyof typeof Ionicons.glyphMap;

function MapChip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: MapIcon }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} aria-pressed={!!selected} accessibilityState={{ selected: !!selected }} onPress={onPress} style={[m.chip, selected && m.selectedChip]}>
    {icon && <Ionicons name={icon} size={16} color={selected ? colors.white : colors.pine} />}
    <Text style={[m.chipText, selected && { color: colors.white }]}>{label}</Text>
  </Pressable>;
}

function MapAction({ title, onPress, icon, secondary = false }: { title: string; onPress: () => void; icon?: MapIcon; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [m.action, secondary && m.secondaryAction, pressed && { opacity: 0.75 }]}>
    {icon && <Ionicons name={icon} size={16} color={colors.pine} />}<Text style={s.link}>{title}</Text>
  </Pressable>;
}

export default function MapBrowser({ onOpenUrl, onOpenCommerceUrl, focusPlaceId, position, onLocate, locationMessage }: Props) {
  const [query, setQuery] = useState('');
  const searchInput = useRef<SearchInputHandle>(null);
  const clearSearch = useCallback(() => { searchInput.current?.clear(); setQuery(''); }, []);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [area, setArea] = useState<MapArea | 'all'>('all');
  const [categories, setCategories] = useState<MapCategory[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [menusOnly, setMenusOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [mapStatus, setMapStatus] = useState<'ready' | 'unavailable'>('ready');
  const wide = useWindowDimensions().width >= 900;
  const results = useMemo(() => {
    const filtered = filterMapPoints(mapPoints, { query, area, categories, menusOnly });
    return position ? filtered.sort((a, b) => mapDistanceKm(a, position) - mapDistanceKm(b, position)) : filtered;
  }, [query, area, categories, menusOnly, position]);
  const markers = useMemo(() => results.map(({ id, name, category, latitude, longitude }) => ({ id, name, category, latitude, longitude })), [results]);
  const counts = useMemo(() => mapCategoryCounts(mapPoints, { query, area, menusOnly }), [query, area, menusOnly]);
  const selected = results.find(p => p.id === detailId) || null;
  useEffect(() => { setShown(PAGE); if (!results.some(p => p.id === selectedId)) setSelectedId(null); if (!results.some(p => p.id === detailId)) setDetailId(null); }, [results]);
  useEffect(() => {
    if (!focusPlaceId) return;
    setViewMode('map');
    const point = mapPoints.find(p => p.relatedPlaceId === focusPlaceId);
    if (point) { clearSearch(); setArea('all'); setCategories([]); setMenusOnly(false); setSelectedId(point.id); }
  }, [focusPlaceId, clearSearch]);
  const openPoint = (id: string) => { if (results.some(p => p.id === id)) { setSelectedId(id); setDetailId(id); } };
  const reset = () => { clearSearch(); setArea('all'); setCategories([]); setMenusOnly(false); };
  const open = (url: string | undefined) => { const safe = safeMapExternalUrl(url); if (safe) onOpenUrl(safe); };
  const toggleCategory = (id: MapCategory) => setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return <View style={m.browser}>
    <SearchInput ref={searchInput} testID="map-search" accessibilityLabel="Search map places" clearAccessibilityLabel="Clear map search" onSearch={setQuery} placeholder="Restaurants, toilets, a favourite lake…" />
    <View style={m.viewToggle}>
      {(['map', 'list'] as const).map(mode => <Pressable key={mode} testID={`map-view-${mode}`} accessibilityRole="button" accessibilityLabel={mode === 'map' ? 'Map view' : 'List view'} aria-pressed={viewMode === mode} accessibilityState={{ selected: viewMode === mode }} onPress={() => setViewMode(mode)} style={[m.viewButton, viewMode === mode && m.selectedChip]}>
        <Ionicons name={mode === 'map' ? 'map-outline' : 'list-outline'} size={18} color={viewMode === mode ? colors.white : colors.pine} /><Text style={[m.chipText, viewMode === mode && { color: colors.white }]}>{mode === 'map' ? 'Map view' : 'List view'}</Text>
      </Pressable>)}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.chips}>
      <MapChip label="Everything" selected={!categories.length} onPress={() => setCategories([])} />
      {mapCategories.map(c => <MapChip key={c.id} label={c.label} icon={icon(c.id)} selected={categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />)}
    </ScrollView>
    <View style={m.controls}>
      <Pressable testID="map-filter-toggle" accessibilityRole="button" accessibilityLabel="Map area and category filters" accessibilityValue={{ text: `${area === 'all' ? 'All areas' : baseNames[area]}${menusOnly ? ' · menus' : ''}` }} accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={m.filter}><Ionicons name="options-outline" size={19} color={colors.green} /><Text style={[s.link, { flexShrink: 1 }]}>{area === 'all' ? 'All areas' : baseNames[area]}{menusOnly ? ' · menus' : ''}</Text><Ionicons name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={15} color={colors.green} /></Pressable>
      <Text accessibilityLiveRegion="polite" testID="map-result-count" style={m.small}>{results.length} {results.length === 1 ? 'place' : 'places'}</Text>
    </View>
    {filtersOpen && <Card style={{ gap: 13 }}>
      <Text style={s.label}>Choose an area</Text>
      <View style={s.wrap}>{(['all', 'banff', 'louise', 'canmore', 'regional'] as const).map(a => <MapChip key={a} label={a === 'all' ? 'All areas' : baseNames[a]} selected={area === a} onPress={() => setArea(a)} />)}</View>
      <Text style={s.label}>Show several categories together</Text>
      <View style={s.wrap}>{mapCategories.map(c => <MapChip key={c.id} label={`${c.label} (${counts[c.id]})`} icon={icon(c.id)} selected={categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />)}</View>
      <MapChip label="With a reviewed menu link" icon="reader-outline" selected={menusOnly} onPress={() => setMenusOnly(!menusOnly)} />
      <MapAction title="Reset map filters" onPress={reset} />
    </Card>}
    {viewMode === 'map' && <View testID="interactive-map"><MapSurface points={markers} selectedId={selectedId} onSelect={openPoint} position={position} viewArea={area} height={wide ? 480 : 370} onMapStatus={setMapStatus} /></View>}
    <View style={m.controls}><Text style={[m.small, { flex: 1, minWidth: 0 }]}>{viewMode === 'map' ? 'Tap a coloured pin for details. Numbered groups open as you zoom.' : 'Browse the matching places below. Open a place for its details and sources.'}</Text><MapAction title="Sort nearby" secondary icon="locate-outline" onPress={onLocate} /></View>
    {!!locationMessage && <Notice>{locationMessage}</Notice>}
    {viewMode === 'map' && mapStatus === 'unavailable' && <Notice>The street map could not load. Browse the place list below; descriptions and filters are available on this device.</Notice>}
    {viewMode === 'map' && <View style={m.legend}>{mapCategories.filter(c => !categories.length || categories.includes(c.id)).map(c => <View key={c.id} style={m.legendItem}><View style={[m.dot, { backgroundColor: c.color }]} /><Text style={m.small}>{c.label}</Text></View>)}</View>}
    <View style={m.listHeading}><Text style={[s.h2, m.listTitle]}>Explore these places</Text>{(query || categories.length > 0 || area !== 'all' || menusOnly) && <MapAction title="Reset" onPress={reset} />}</View>
    {!results.length ? <Empty title="No places match those filters" body="Try another area, switch categories or clear your search." action="Reset map filters" onPress={reset} /> : <>
      <View style={[m.cards, wide && m.wideCards]}>{results.slice(0, shown).map(point => <Pressable key={point.id} accessibilityRole="button" accessibilityLabel={`View map details for ${point.name}`} onPress={() => openPoint(point.id)} style={[m.result, wide && m.wideCard, point.id === selectedId && { borderColor: colors.green, borderWidth: 2 }]}>
        <View style={m.cardTitle}><View style={[m.badge, { backgroundColor: category(point.category).color }]}><Ionicons name={icon(point.category)} color="white" size={20} /></View><View style={{ flex: 1, gap: 3 }}><Text style={m.name}>{point.name}</Text><Text style={m.small}>{category(point.category).label} · {baseNames[point.area]}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.green} /></View>
        <Text style={s.body} numberOfLines={2}>{point.description}</Text>
        <View style={s.wrap}>{!!safeMapExternalUrl(point.menuUrl) && <Text style={m.tag}>Menu link</Text>}{position && <Text style={m.small}>{mapDistanceKm(point, position).toFixed(1)} km straight-line</Text>}</View>
      </Pressable>)}</View>
      {shown < results.length && <Button title={`Show more places (${results.length - shown} more)`} variant="secondary" onPress={() => setShown(shown + PAGE)} />}
    </>}
    <Text style={m.footnote}>Place details are bundled; online map tiles, menus and booking pages need a connection. Map features may mark a building or site centre. Check the entrance, access and signs on arrival.</Text>
    <Pressable accessibilityRole="link" onPress={() => open('https://www.openstreetmap.org/copyright')}><Text style={[s.link, { fontSize: 12 }]}>Map data © OpenStreetMap contributors · ODbL</Text></Pressable>
    <Pressable accessibilityRole="link" onPress={() => open('https://banffbound.com/app/map-data/osm-points.json')}><Text style={[s.link, { fontSize: 12 }]}>Open map-data download and licence</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Map software licence" accessibilityState={{ expanded: creditsOpen }} onPress={() => setCreditsOpen(!creditsOpen)}><Text style={[s.link, { fontSize: 12 }]}>Map software licence</Text></Pressable>
    {creditsOpen && <Text style={m.footnote}>{leafletLicense}</Text>}
    <Text style={m.footnote}>Map directory {mapDataVersion}. Public facilities, opening hours and menus can change.</Text>
    <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setDetailId(null)}>
      <View style={m.scrim} accessibilityViewIsModal><View style={m.sheet}><SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={m.sheetHeader}><Text style={s.eyebrow}>EXPLORE YOUR KIND OF BANFF</Text><Pressable testID="map-close-details" accessibilityRole="button" accessibilityLabel="Close map details" onPress={() => setDetailId(null)} style={m.close}><Ionicons name="close" size={24} color={colors.pine} /></Pressable></View>
        <ScrollView contentContainerStyle={m.detailBody} keyboardShouldPersistTaps="handled">{selected && <>
          <View style={[m.detailBadge, { backgroundColor: category(selected.category).color }]}><Ionicons name={icon(selected.category)} size={28} color="white" /></View>
          <Text style={s.eyebrow}>{category(selected.category).label.toUpperCase()} · {baseNames[selected.area].toUpperCase()}</Text>
          <Text testID="map-detail-title" style={[s.h1, { fontSize: 29, lineHeight: 35 }]}>{selected.name}</Text>
          <Text style={[s.body, { color: colors.ink }]}>{selected.description}</Text>
          {!!selected.address && <Text style={s.body}>{selected.address}</Text>}
          {!!selected.cuisine && <View style={{ gap: 5 }}><Text style={s.h3}>Food & drink</Text><Text style={s.body}>{selected.cuisine}</Text></View>}
          {!!selected.highlights.length && <View style={{ gap: 7 }}>{selected.highlights.map((text, i) => <Text key={i} style={s.body}>• {text}</Text>)}</View>}
          {!!selected.menuUrl && safeMapExternalUrl(selected.menuUrl) && <View style={m.section}><Text style={s.h3}>Menu details</Text><Text style={s.body}>Open the venue’s published menu for its current dishes, drinks and prices. Ask the venue directly about dietary requirements.</Text><Button title="View the venue menu" icon="reader-outline" onPress={() => open(selected.menuUrl)} /><Text style={m.footnote}>{new URL(selected.menuUrl).hostname}</Text></View>}
          {['restaurants', 'cafes'].includes(selected.category) && !safeMapExternalUrl(selected.menuUrl) && <Notice>A reviewed menu link is not available for this place yet. Check the venue or its source record for current food service.</Notice>}
          {!!selected.facilities?.length && <View style={m.section}><Text style={s.h3}>Facilities & access</Text>{selected.facilities.map((f, i) => <View key={i} style={{ gap: 3 }}><Text style={s.label}>{f.label}</Text><Text style={s.body}>{f.value}</Text></View>)}</View>}
          {selected.details?.map((d, i) => <View key={i} style={m.section}><Text style={s.h3}>{d.title}</Text><Text style={s.body}>{d.body}</Text></View>)}
          {!!selected.commerceItemIds?.length && <View style={m.section}><Text style={s.h3}>Tickets & stays to consider</Text>{commerceItems.filter(i => selected.commerceItemIds!.includes(i.id)).slice(0, 4).map(item => <Card key={item.id} style={{ gap: 10 }}><Text style={s.h3}>{item.title}</Text><Text style={s.body}>{item.summary}</Text>{!!item.notice && <Notice>{item.notice}</Notice>}<AffiliateButtons links={item.links} status={item.status} onOpenUrl={onOpenCommerceUrl} /></Card>)}</View>}
          {!selected.commerceItemIds?.length && <RelatedCommerceLinks placeId={selected.relatedPlaceId} activityId={selected.relatedActivityIds?.[0]} onOpenUrl={onOpenCommerceUrl} />}
          {!!safeMapExternalUrl(selected.websiteUrl) && selected.websiteUrl !== selected.menuUrl && <Button title="Visit the venue website" icon="open-outline" variant="secondary" onPress={() => open(selected.websiteUrl)} />}
          {!!safeMapExternalUrl(selected.guideUrl) && <Button title="Read the BanffBound guide" icon="book-outline" variant="secondary" onPress={() => open(selected.guideUrl)} />}
          <Button title="Open map location" variant="ghost" icon="map-outline" onPress={() => open(mapLocationUrl(selected) || undefined)} />
          <Notice>{selected.coordinateNote}</Notice>
          <View style={m.section}><Text style={s.h3}>Sources & updates</Text>{selected.sources.map((source, i) => <View key={i} style={{ gap: 4 }}><Pressable accessibilityRole="link" onPress={() => open(source.url)}><Text style={s.link}>{source.label}</Text></Pressable><Text style={m.footnote}>Source checked {source.checkedAt.slice(0, 10)}{source.kind === 'osm' ? ' · community map record' : ''}</Text></View>)}</View>
        </>}</ScrollView>
      </SafeAreaView></View></View>
    </Modal>
  </View>;
}
const m = StyleSheet.create({
  viewToggle: { flexDirection: 'row', gap: 8 }, viewButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 12 },
  chip: { minHeight: 44, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 7 }, selectedChip: { backgroundColor: colors.pine, borderColor: colors.pine }, chipText: { fontSize: 12, fontWeight: '500', color: colors.ink },
  action: { minHeight: 44, minWidth: 44, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, secondaryAction: { backgroundColor: colors.pale, borderColor: colors.pale },
  listHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, listTitle: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: 200 },
  browser: { gap: 13 }, chips: { gap: 8, paddingVertical: 2 }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, filter: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, minWidth: 0, flexShrink: 1 }, small: { fontSize: 12, lineHeight: 18, color: colors.muted }, legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, dot: { width: 9, height: 9, borderRadius: 5 }, cards: { gap: 12 }, wideCards: { flexDirection: 'row', flexWrap: 'wrap' }, result: { borderWidth: 1, borderColor: colors.line, borderRadius: 19, padding: 18, gap: 10, backgroundColor: colors.white }, wideCard: { width: '48.7%', flexGrow: 1, maxWidth: '50%' }, cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 11 }, name: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '600' }, badge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, tag: { color: colors.green, fontSize: 11, fontWeight: '600' }, footnote: { fontSize: 11, lineHeight: 17, color: colors.muted }, scrim: { flex: 1, backgroundColor: 'rgba(12,32,25,0.48)', alignItems: 'center', justifyContent: 'flex-end' }, sheet: { width: '100%', maxWidth: 820, height: '92%', backgroundColor: colors.cream, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' }, sheetHeader: { paddingHorizontal: 21, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line }, close: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }, detailBody: { padding: 23, paddingBottom: 40, gap: 18 }, detailBadge: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, section: { gap: 10 },
});
