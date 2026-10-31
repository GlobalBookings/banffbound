import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { commerceItems, commerceSections, type CommerceItem, type CommerceLink, type CommerceSection } from '../data/commerce';
import { COMMERCE_PAGE_SIZE, commerceFacets, commerceLinkTitle, filterCommerceItems, isAllowedCommerceUrl, relatedCommerceItems, safeCommerceUrl } from '../lib/commerce';
import { Button, Card, Chip, Empty, Notice, colors, s } from './ui';
import SearchInput, { type SearchInputHandle } from './SearchInput';

type OpenUrl = (url: string) => void;
const icons: Record<CommerceSection, keyof typeof Ionicons.glyphMap> = { tours: 'ticket-outline', stays: 'bed-outline', guides: 'book-outline', extras: 'sparkles-outline' };
const isWebsiteGuidance = (item: CommerceItem) => item.links.length > 0 && item.links.every(link => link.provider === 'BanffBound' && link.kind === 'guide' && !link.affiliate);
function cardDescription(item: CommerceItem): string {
  if (item.section === 'guides') return 'Full guide online';
  if (isWebsiteGuidance(item)) return 'Website guide';
  if (item.links.some(link => link.kind === 'search')) return 'Browse partner options';
  return item.status === 'reference-only'
    ? item.section === 'stays' ? 'Check current listing' : 'View partner options'
    : item.status === 'check-details' ? 'Check dates & details' : 'View details & options';
}

/** The parent opens a system browser. No prefetch, tracking request or app-link fallback. */
export function AffiliateButtons({ links, onOpenUrl, status, compact = false }: { links: readonly CommerceLink[]; onOpenUrl: OpenUrl; status?: CommerceItem['status']; compact?: boolean }) {
  const permitted = links.filter(link => safeCommerceUrl(link) !== null);
  if (!permitted.length) return null;
  return <View style={{ gap: compact ? 10 : 14 }}>
    {permitted.map(link => <View key={link.id} style={c.linkGroup}>
      <View style={c.providerLine}>
        <Text style={c.provider}>{link.provider}</Text>
        <Text style={c.linkType}>{link.kind === 'search' ? 'Destination search' : link.kind === 'guide' ? 'BanffBound guide' : link.kind === 'referral' ? 'Partner website' : link.kind === 'property' ? 'Property listing' : 'Tour or ticket'}</Text>
      </View>
      {!!link.label && <Text style={c.linkLabel}>{link.label}</Text>}
      <Pressable testID={`commerce-cta-${link.id}`} accessibilityRole="link" accessibilityLabel={`${commerceLinkTitle(link, status)} on ${link.provider}`} accessibilityHint="Opens a browser. Dates, availability and booking terms are checked on the provider website." onPress={() => { if (safeCommerceUrl(link)) onOpenUrl(link.url); }} style={({ pressed }) => [c.cta, link.kind === 'guide' && c.guideCta, pressed && { opacity: 0.76 }]}>
        <Text style={[c.ctaText, link.kind === 'guide' && { color: colors.pine }]}>{commerceLinkTitle(link, status)}</Text>
        <Ionicons name="open-outline" size={17} color={link.kind === 'guide' ? colors.pine : colors.white} />
      </Pressable>
      {link.affiliate && <Text style={c.disclosure}>Affiliate link. BanffBound may earn a commission if you book.</Text>}
    </View>)}
  </View>;
}

function StatusNote({ item }: { item: CommerceItem }) {
  if (!item.notice && item.status !== 'reference-only' && item.status !== 'check-details') return null;
  return <Notice>{item.notice || (item.section === 'guides' || isWebsiteGuidance(item)
    ? 'Read the full website guide online and check dated advice against current official or provider information.'
    : item.status === 'reference-only' ? 'This is a retained directory lead. Confirm its current identity, address and operation on the provider website.' : 'Check the current date, route, inclusions and terms before booking.')}</Notice>;
}

function CommerceDetail({ item, onClose, onOpenUrl }: { item: CommerceItem | null; onClose: () => void; onOpenUrl: OpenUrl }) {
  return <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
    <View style={c.scrim} accessibilityViewIsModal>
      <View style={c.sheet}>
        <View style={c.sheetHeader}>
          <Text style={s.eyebrow}>{item ? commerceSections.find(section => section.id === item.section)?.title : 'EXPLORE'}</Text>
          <Pressable testID="commerce-close-details" accessibilityRole="button" accessibilityLabel="Close details" onPress={onClose} hitSlop={10} style={c.close}><Ionicons name="close" size={23} color={colors.pine} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={c.detailBody}>
          {item && <>
            <View style={c.detailIcon}><Ionicons name={icons[item.section]} size={29} color={colors.green} /></View>
            <Text style={c.location}>{item.area} · {item.category}</Text>
            <Text style={[s.h1, { fontSize: 30, lineHeight: 36 }]}>{item.title}</Text>
            {!!item.operator && <Text style={c.provider}>Listed operator: {item.operator}</Text>}
            <Text style={[s.body, { color: colors.ink }]}>{item.summary}</Text>
            <StatusNote item={item} />
            <AffiliateButtons links={item.links} status={item.status} onOpenUrl={onOpenUrl} />
            {item.guideUrl && !item.links.some(link => link.url === item.guideUrl) && isAllowedCommerceUrl(item.guideUrl) && <Button title="Read the BanffBound guide in browser" variant="secondary" icon="book-outline" onPress={() => onOpenUrl(item.guideUrl!)} />}
            <Text style={c.footnote}>{item.section === 'guides' ? 'This guide index is available in the app. The full website guide opens in your browser and needs a connection.' : isWebsiteGuidance(item) ? 'Read the full website guide and any product links in your browser. These pages need a connection.' : 'Choose your dates and exact option on the provider website. Current prices, availability and booking confirmation are provided there.'} Your itinerary and booking checklist stay in BanffBound.</Text>
            {!!item.reviewedAt && <Text style={c.footnote}>Source review: {item.reviewedAt}. A source review does not establish current availability.</Text>}
          </>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

export default function CommerceBrowser({ section, onOpenUrl }: { section: CommerceSection; onOpenUrl: OpenUrl }) {
  const [query, setQuery] = useState('');
  const searchInput = useRef<SearchInputHandle>(null);
  const [area, setArea] = useState('all');
  const [category, setCategory] = useState('all');
  const [shown, setShown] = useState(COMMERCE_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<CommerceItem | null>(null);
  const wide = useWindowDimensions().width >= 900;
  const heading = commerceSections.find(item => item.id === section);
  const facets = useMemo(() => commerceFacets(commerceItems, section), [section]);
  const results = useMemo(() => filterCommerceItems(commerceItems, { section, query, area, category }), [section, query, area, category]);
  useEffect(() => { searchInput.current?.clear(); setQuery(''); setArea('all'); setCategory('all'); setSelected(null); setFiltersOpen(false); }, [section]);
  useEffect(() => setShown(COMMERCE_PAGE_SIZE), [section, query, area, category]);
  const resetFilters = () => { searchInput.current?.clear(); setQuery(''); setArea('all'); setCategory('all'); };
  return <View style={c.browser}>
    <View style={c.headingRow}>
      <View style={{ flex: 1, gap: 5 }}><Text style={s.h2}>{heading?.title || 'Explore more'}</Text><Text style={s.body}>{heading?.summary}</Text></View>
      <View style={c.headingIcon}><Ionicons name={icons[section]} size={23} color={colors.green} /></View>
    </View>
    <SearchInput ref={searchInput} testID={`commerce-search-${section}`} accessibilityLabel={`Search ${heading?.title || section}`} onSearch={setQuery} placeholder={`Search ${section === 'extras' ? 'transport, rentals and more' : section}…`} />
    <View style={c.filterBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Filter by area and topic" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={c.filterToggle}><Ionicons name="options-outline" size={18} color={colors.green} /><Text style={s.link}>Filters{area !== 'all' || category !== 'all' ? ' · active' : ''}</Text><Ionicons name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={15} color={colors.green} /></Pressable>
      <Text accessibilityLiveRegion="polite" style={c.resultCount}>{results.length} {results.length === 1 ? 'result' : 'results'}</Text>
    </View>
    {filtersOpen && <Card style={{ gap: 12 }}>
      <Text style={s.label}>Area</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={c.chips}><Chip label="All areas" selected={area === 'all'} onPress={() => setArea('all')} />{facets.areas.map(value => <Chip key={value} label={value} selected={area === value} onPress={() => setArea(value)} />)}</ScrollView>
      <Text style={s.label}>Topic</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={c.chips}><Chip label="All topics" selected={category === 'all'} onPress={() => setCategory('all')} />{facets.categories.map(value => <Chip key={value} label={value} selected={category === value} onPress={() => setCategory(value)} />)}</ScrollView>
      {(area !== 'all' || category !== 'all') && <Button title="Clear filters" variant="ghost" small onPress={() => { setArea('all'); setCategory('all'); }} />}
    </Card>}
    {!results.length ? <Empty title="A different kind of adventure?" body="Try a different place, topic or search term." action="Reset search and filters" onPress={resetFilters} /> : <>
      <View style={[c.cards, wide && c.wideCards]}>
        {results.slice(0, shown).map(item => <Pressable key={item.id} testID={`commerce-card-${item.id}`} accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.area}. ${item.category}. View details.`} onPress={() => setSelected(item)} style={({ pressed }) => [c.resultCard, wide && c.wideCard, pressed && { opacity: 0.8 }]}>
          <View style={c.cardTop}><View style={c.cardIcon}><Ionicons name={icons[item.section]} size={23} color={colors.green} /></View><Ionicons name="arrow-forward" size={21} color={colors.green} /></View>
          <Text style={c.location}>{item.area} · {item.category}</Text>
          <Text style={c.cardTitle}>{item.title}</Text>
          <Text style={s.body} numberOfLines={3}>{item.summary}</Text>
          <View style={c.cardFooter}><Text style={c.cardKind}>{cardDescription(item)}</Text><Text style={c.providerSmall}>{[...new Set(item.links.map(link => link.provider))].join(' · ')}</Text></View>
        </Pressable>)}
      </View>
      {shown < results.length && <Button title={`Show ${Math.min(COMMERCE_PAGE_SIZE, results.length - shown)} more`} variant="secondary" onPress={() => setShown(value => value + COMMERCE_PAGE_SIZE)} />}
      <Text style={c.footnote}>Showing {Math.min(shown, results.length)} of {results.length}. Search and summaries work offline. Full guides and provider websites need a connection.</Text>
    </>}
    <CommerceDetail item={selected} onClose={() => setSelected(null)} onOpenUrl={onOpenUrl} />
  </View>;
}

export function RelatedCommerceLinks({ placeId, activityId, onOpenUrl }: { placeId?: string; activityId?: string; onOpenUrl: OpenUrl }) {
  const related = useMemo(() => relatedCommerceItems(commerceItems, { placeId, activityId }).slice(0, 3), [placeId, activityId]);
  if (!related.length) return null;
  return <View style={c.related}>
    <Text style={s.h3}>Tours, tickets & stays to consider</Text>
    {related.map(item => <Card key={item.id} style={{ gap: 12 }}><Text style={c.location}>{item.area}</Text><Text style={s.h3}>{item.title}</Text><Text style={s.body}>{item.summary}</Text><StatusNote item={item} /><AffiliateButtons links={item.links} status={item.status} onOpenUrl={onOpenUrl} compact /></Card>)}
  </View>;
}

const c = StyleSheet.create({
  browser: { gap: 16 }, headingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headingIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 42, paddingHorizontal: 4 }, resultCount: { fontSize: 13, color: colors.muted }, chips: { gap: 8, paddingVertical: 3 },
  cards: { gap: 14 }, wideCards: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
  resultCard: { padding: 19, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.white, gap: 12 }, wideCard: { width: '48.5%', flexGrow: 1, maxWidth: '50%' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.pale, justifyContent: 'center', alignItems: 'center' },
  location: { color: colors.green, fontSize: 11, lineHeight: 17, fontWeight: '600' }, cardTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: '600' },
  cardFooter: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 5 }, cardKind: { color: colors.green, fontSize: 12, fontWeight: '600' }, providerSmall: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  linkGroup: { gap: 8 }, providerLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }, provider: { color: colors.pine, fontWeight: '700', fontSize: 13 }, linkType: { color: colors.muted, fontSize: 11 },
  cta: { backgroundColor: colors.pine, borderRadius: 13, minHeight: 48, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, guideCta: { backgroundColor: colors.pale }, ctaText: { color: colors.white, fontWeight: '600', fontSize: 14, flex: 1 },
  disclosure: { fontSize: 11, lineHeight: 17, color: colors.muted }, footnote: { fontSize: 12, lineHeight: 19, color: colors.muted },
  linkLabel: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  scrim: { flex: 1, backgroundColor: 'rgba(12,32,25,0.48)', justifyContent: 'flex-end', alignItems: 'center' }, sheet: { backgroundColor: colors.cream, width: '100%', maxWidth: 820, height: '91%', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line }, close: { minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  detailBody: { padding: 24, paddingBottom: 44, gap: 20 }, detailIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }, related: { gap: 14 },
});
