import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapSurface from './MapSurface';
import { leafletLicense } from '../lib/vendor/leaflet-license';
import { mapCategories, type MapArea, type MapCategory, type MapPoint } from '../data/map';
import { mapPoints, mapDataVersion } from '../data/map.generated';
import { commerceItems } from '../data/commerce';
import { AffiliateButtons, RelatedCommerceLinks } from './CommerceBrowser';
import { Button, Card, Chip, Empty, Notice, baseNames, colors, s } from './ui';
import { filterMapPoints, mapCategoryCounts, mapDistanceKm, mapLocationUrl, safeMapExternalUrl } from '../lib/map';

type Props = { onOpenUrl: (url: string) => void; onOpenCommerceUrl: (url: string) => void; focusPlaceId?: string | null; position: { latitude: number; longitude: number } | null; onLocate: () => void; locationMessage: string };
const PAGE = 18;
const category = (id: MapCategory) => mapCategories.find(c => c.id === id)!;
const icon = (id: MapCategory) => category(id).icon as keyof typeof Ionicons.glyphMap;

export default function MapBrowser({ onOpenUrl, onOpenCommerceUrl, focusPlaceId, position, onLocate, locationMessage }: Props) {
  const [query, setQuery] = useState('');
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
    const point = mapPoints.find(p => p.relatedPlaceId === focusPlaceId);
    if (point) { setQuery(''); setArea('all'); setCategories([]); setMenusOnly(false); setSelectedId(point.id); }
  }, [focusPlaceId]);
  const openPoint = (id: string) => { if (results.some(p => p.id === id)) { setSelectedId(id); setDetailId(id); } };
  const reset = () => { setQuery(''); setArea('all'); setCategories([]); setMenusOnly(false); };
  const open = (url: string | undefined) => { const safe = safeMapExternalUrl(url); if (safe) onOpenUrl(safe); };
  const toggleCategory = (id: MapCategory) => setCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return <View style={m.browser}>
    <View style={m.search}>
      <Ionicons name="search-outline" size={20} color={colors.muted} />
      <TextInput testID="map-search" accessibilityLabel="Search map places" value={query} onChangeText={setQuery} maxLength={180} autoCorrect={false} placeholder="Restaurants, toilets, a favourite lake…" placeholderTextColor={colors.muted} style={m.input} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Clear map search" hitSlop={10} onPress={() => setQuery('')}><Ionicons name="close-circle" size={21} color={colors.muted} /></Pressable>}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.chips}>
      <Chip label="Everything" selected={!categories.length} onPress={() => setCategories([])} />
      {mapCategories.map(c => <Chip key={c.id} label={c.label} icon={icon(c.id)} selected={categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />)}
    </ScrollView>
    <View style={m.controls}>
      <Pressable testID="map-filter-toggle" accessibilityRole="button" accessibilityLabel="Map area and category filters" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={m.filter}><Ionicons name="options-outline" size={19} color={colors.green} /><Text style={s.link}>{area === 'all' ? 'All areas' : baseNames[area]}{menusOnly ? ' · menus' : ''}</Text><Ionicons name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={15} color={colors.green} /></Pressable>
      <Text accessibilityLiveRegion="polite" testID="map-result-count" style={m.small}>{results.length} {results.length === 1 ? 'place' : 'places'}</Text>
    </View>
    {filtersOpen && <Card style={{ gap: 13 }}>
      <Text style={s.label}>Choose an area</Text>
      <View style={s.wrap}>{(['all', 'banff', 'louise', 'canmore', 'regional'] as const).map(a => <Chip key={a} label={a === 'all' ? 'All areas' : baseNames[a]} selected={area === a} onPress={() => setArea(a)} />)}</View>
      <Text style={s.label}>Show several categories together</Text>
      <View style={s.wrap}>{mapCategories.map(c => <Chip key={c.id} label={`${c.label} (${counts[c.id]})`} icon={icon(c.id)} selected={categories.includes(c.id)} onPress={() => toggleCategory(c.id)} />)}</View>
      <Chip label="With a reviewed menu link" icon="reader-outline" selected={menusOnly} onPress={() => setMenusOnly(!menusOnly)} />
      <Button title="Reset map filters" small variant="ghost" onPress={reset} />
    </Card>}
    <View testID="interactive-map"><MapSurface points={markers} selectedId={selectedId} onSelect={openPoint} position={position} viewArea={area} height={wide ? 480 : 370} onMapStatus={setMapStatus} /></View>
    <View style={m.controls}><Text style={[m.small, { flex: 1 }]}>Tap a coloured pin for details. Numbered groups open as you zoom.</Text><Button title="Sort nearby" small variant="secondary" icon="locate-outline" onPress={onLocate} /></View>
    {!!locationMessage && <Notice>{locationMessage}</Notice>}
    {mapStatus === 'unavailable' && <Notice>The street map could not load. Browse the place list below; descriptions and filters are available on this device.</Notice>}
    <View style={m.legend}>{mapCategories.filter(c => !categories.length || categories.includes(c.id)).map(c => <View key={c.id} style={m.legendItem}><View style={[m.dot, { backgroundColor: c.color }]} /><Text style={m.small}>{c.label}</Text></View>)}</View>
    <View style={m.controls}><Text style={s.h2}>Explore these places</Text>{(query || categories.length > 0 || area !== 'all' || menusOnly) && <Button title="Reset" small variant="ghost" onPress={reset} />}</View>
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
  browser: { gap: 13 }, search: { minHeight: 52, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14 }, input: { minWidth: 0, flex: 1, paddingVertical: 13, fontSize: 15, color: colors.ink }, chips: { gap: 8, paddingVertical: 2 }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, filter: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 }, small: { fontSize: 12, lineHeight: 18, color: colors.muted }, legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, dot: { width: 9, height: 9, borderRadius: 5 }, cards: { gap: 12 }, wideCards: { flexDirection: 'row', flexWrap: 'wrap' }, result: { borderWidth: 1, borderColor: colors.line, borderRadius: 19, padding: 18, gap: 10, backgroundColor: colors.white }, wideCard: { width: '48.7%', flexGrow: 1, maxWidth: '50%' }, cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 11 }, name: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '600' }, badge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, tag: { color: colors.green, fontSize: 11, fontWeight: '600' }, footnote: { fontSize: 11, lineHeight: 17, color: colors.muted }, scrim: { flex: 1, backgroundColor: 'rgba(12,32,25,0.48)', alignItems: 'center', justifyContent: 'flex-end' }, sheet: { width: '100%', maxWidth: 820, height: '92%', backgroundColor: colors.cream, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' }, sheetHeader: { paddingHorizontal: 21, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line }, close: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }, detailBody: { padding: 23, paddingBottom: 40, gap: 18 }, detailBadge: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, section: { gap: 10 },
});
