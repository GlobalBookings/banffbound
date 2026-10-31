"""Independent, offline validation of the reviewed native-web upload files."""
import collections
import copy
import csv
import hashlib
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlparse

folder = Path(__file__).resolve().parent
repo = folder.parents[1]
load = lambda name: json.loads((folder / name).read_text())
digest = lambda value: hashlib.sha256(value).hexdigest()
manifest = load('manifest.json')
source = load('source-groups.json')
review = load('review-copy.json')
existing = load('existing-state.json')
templates = load('template-provenance.json')['templates']
campaign_id = '24416287886'
campaign_name = 'BB | CA | Search | Winter activities | 50GBP test'
file_templates = {
    '01-new-ad-groups.csv': 'ad_group',
    '02-new-responsive-search-ads.csv': 'responsive_search_ad',
    '03-new-group-keywords.csv': 'keyword',
    '04-existing-group-keyword-additions.csv': 'keyword',
}
assert {p.name for p in folder.glob('*.csv')} == set(file_templates)
assert {item['file'] for item in manifest['files']} == set(file_templates)
rows = {}
for item in manifest['files']:
    assert item['template'] == file_templates[item['file']]
    raw = (folder / item['file']).read_bytes()
    assert digest(raw) == item['sha256'], 'CSV changed after the recorded review.'
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8'), newline=''))
    assert reader.fieldnames == templates[item['template']]['headers'], 'Use exact native template headers.'
    values = list(reader)
    assert len(values) == item['rows']
    assert all(None not in row and None not in row.values() for row in values)
    rows[item['file']] = values
for item in manifest['reviewArtifacts']:
    assert digest((folder / item['file']).read_bytes()) == item['sha256']
for item in manifest['sourceInputs']:
    filename = (repo / item['file']).resolve()
    assert filename.is_relative_to(repo.resolve())
    assert digest(filename.read_bytes()) == item['sha256'], 'Source model/copy changed; regenerate and review again.'

groups = {group['id']: group for group in source['groups']}
copies = {group['id']: group for group in review['groups']}
assert len(groups) == len(source['groups']) and len(copies) == len(review['groups'])
assert set(groups) == set(copies)
assert all(group['launchState'] in {'ready', 'held'} for group in groups.values())
assert len(existing['savedAds']) == 13 and len(existing['savedKeywords']) == 97

def path_only(value):
    url = urlparse(value)
    assert url.scheme == 'https' and url.netloc == 'banffbound.com' and not url.query and not url.fragment
    assert re.fullmatch(r'/(blog|activities|experiences|book)/[a-z0-9-]+/?', url.path)
    return url.path.rstrip('/') + '/'

prior_paths = {path_only(ad['finalUrl']): ad for ad in existing['savedAds']}
assert len(prior_paths) == 13

def term(value, match_type):
    result = ' '.join(value.lower().split())
    if match_type == 'Exact match' and result.startswith('[') and result.endswith(']'):
        result = result[1:-1]
    if match_type == 'Phrase match' and result.startswith('"') and result.endswith('"'):
        result = result[1:-1]
    return result

old_keywords = {(k['groupId'], k['matchType'], term(k['term'], k['matchType'])) for k in existing['savedKeywords']}
assert len(old_keywords) == 97
merchant = re.compile(r'\b(getyourguide|gyg|viator|tripadvisor|expedia|radventures|discover banff tours|abestx|fairy bus|horizon touring|banff todo|banff daytrips|rockies journey|pursuit|banff explorer|brewster|fairmont)\b', re.I)
targets = {}
new_family_ids = set()
reuse_ids = set()
expected_new_terms, expected_existing_terms = set(), set()
covered_candidates = 0
candidate_owners = set()
for family_id, group in groups.items():
    guide = path_only('https://banffbound.com' + group['canonicalPath'])
    prior = prior_paths.get(guide)
    c = copies[family_id]
    assert set(c) == {'id', 'adGroupName', 'exactKeywords', 'phraseKeywords', 'headlines', 'descriptions'}
    assert c['id'] == family_id and 0 < len(c['adGroupName']) <= 128
    assert 6 <= len(c['exactKeywords']) + len(c['phraseKeywords']) <= 10
    assert len(c['exactKeywords']) >= 3 and len(c['phraseKeywords']) >= 2
    assert 6 <= len(c['headlines']) <= 10 and all(0 < len(x) <= 30 for x in c['headlines'])
    assert 2 <= len(c['descriptions']) <= 4 and all(0 < len(x) <= 90 for x in c['descriptions'])
    assert all(not merchant.search(x) for key in ['exactKeywords', 'phraseKeywords', 'headlines', 'descriptions'] for x in c[key])
    status = 'Enabled' if group['launchState'] == 'ready' else 'Paused'
    name = prior['group'] if prior else c['adGroupName']
    assert name not in targets, 'Every distinct guide family needs one non-colliding destination group.'
    target = {'id': family_id, 'name': name, 'guide': guide, 'status': status, 'prior': prior, 'copy': c}
    targets[name] = target
    (reuse_ids if prior else new_family_ids).add(family_id)
    for match_type, values in [('Exact match', c['exactKeywords']), ('Phrase match', c['phraseKeywords'])]:
        assert len(values) == len({term(x, match_type) for x in values})
        for value in values:
            assert value == value.strip() and not re.search(r'[\[\]"<>\r\n]', value)
            assert len(value) <= 80 and len(value.split()) <= 10
            normalized = term(value, match_type)
            assert (match_type, normalized) not in candidate_owners, 'Candidate terms must have one family per match type.'
            candidate_owners.add((match_type, normalized))
            if prior and (prior['groupId'], match_type, normalized) in old_keywords:
                covered_candidates += 1
            else:
                (expected_existing_terms if prior else expected_new_terms).add((name, match_type, normalized))

def validate(actual):
    assert set(actual) == set(file_templates)
    for filename, values in actual.items():
        row_type = 'Ad group' if filename.startswith('01') else 'Ad' if filename.startswith('02') else 'Keyword'
        status_field = {'Ad group': 'Ad group status', 'Ad': 'Ad status', 'Keyword': 'Keyword status'}[row_type]
        for row in values:
            assert set(row) == set(templates[file_templates[filename]]['headers'])
            assert row['Row Type'] == row_type and row['Action'] == 'Add', 'No campaign or existing-object edit/remove rows.'
            assert row['Campaign ID'] == campaign_id and row['Campaign'] == campaign_name
            target = targets[row['Ad group']]
            assert row[status_field] == target['status'], 'Held families must stay Paused at every added level.'
            assert not row.get('Ad ID') and not row.get('Keyword ID')
            assert not row.get('Tracking template') and not row.get('Custom parameter')
            assert not row.get('Label') and not row.get('Mobile final URL')
            allowed = {'Row Type', 'Action', status_field, 'Campaign ID', 'Campaign', 'Ad group ID', 'Ad group'}
            if row_type == 'Ad group':
                allowed |= {'Ad group type', 'Default max. CPC'}
            elif row_type == 'Ad':
                allowed |= {'Ad type', 'Final URL', 'Final URL suffix'}
                allowed |= {'Headline ' + str(i) for i in range(1, 16)}
                allowed |= {'Description ' + str(i) for i in range(1, 5)}
            else:
                allowed |= {'Keyword', 'Type', 'Default max. CPC'}
            assert all(not value for key, value in row.items() if key not in allowed), 'Unreviewed optional fields must stay empty.'
            if filename.startswith('04'):
                assert target['prior'] and row['Ad group ID'] == target['prior']['groupId']
            else:
                assert not target['prior'] and not row.get('Ad group ID'), 'Existing groups do not receive new groups or RSAs.'
            if row_type in {'Ad group', 'Keyword'}:
                assert row['Default max. CPC'] == '0.07'
            if row_type == 'Ad group':
                assert row['Ad group type'] == 'Standard' and not row['Final URL suffix']
            if row_type == 'Ad':
                assert row['Ad type'] == 'Responsive search ad'
                assert path_only(row['Final URL']) == target['guide']
                assert row['Final URL'] == 'https://banffbound.com' + target['guide']
                expected_suffix = {'utm_source': ['google'], 'utm_medium': ['cpc'], 'utm_campaign': ['bb_ca_winter_50_test'], 'utm_content': ['experience_' + target['id'].replace('-', '_') + '_rsa']}
                assert parse_qs(row['Final URL suffix'], strict_parsing=True) == expected_suffix
                assert [row['Headline ' + str(i)] for i in range(1, 16) if row['Headline ' + str(i)]] == target['copy']['headlines']
                assert [row['Description ' + str(i)] for i in range(1, 5) if row['Description ' + str(i)]] == target['copy']['descriptions']
                assert not any(row[k] for k in row if k.endswith(' position'))
                assert not row['Path 1'] and not row['Path 2']
            if row_type == 'Keyword':
                assert row['Type'] in {'Exact match', 'Phrase match'} and not row['Final URL'] and not row['Final URL suffix']
                assert row['Keyword'] == row['Keyword'].strip() and not re.search(r'[\[\]"<>\r\n]', row['Keyword'])
                assert 0 < len(row['Keyword']) <= 80 and len(row['Keyword'].split()) <= 10
    new_groups = actual['01-new-ad-groups.csv']
    new_ads = actual['02-new-responsive-search-ads.csv']
    assert {targets[row['Ad group']]['id'] for row in new_groups} == new_family_ids and len(new_groups) == len(new_family_ids)
    assert {targets[row['Ad group']]['id'] for row in new_ads} == new_family_ids and len(new_ads) == len(new_family_ids)
    for filename, expected in [('03-new-group-keywords.csv', expected_new_terms), ('04-existing-group-keyword-additions.csv', expected_existing_terms)]:
        values = actual[filename]
        identity = [(row['Ad group'], row['Type'], term(row['Keyword'], row['Type'])) for row in values]
        assert set(identity) == expected and len(identity) == len(expected), 'Only novel reviewed terms may be added.'
    p = manifest['preservation']
    assert p['campaignRows'] == p['budgetRows'] == p['hotelRows'] == p['sharedAccountAssetRows'] == 0
    assert p['existingAdRows'] == p['existingGroupEdits'] == p['existingKeywordEdits'] == 0
    assert p['totalBudgetGBPUnchanged'] == 50 and p['campaignMaximumCpcGBPUnchanged'] == .07
    assert p['bidStrategyUnchanged'] == 'Maximize clicks' and p['networksUnchanged'] == 'Google Search only'
    assert p['locationUnchanged'] == 'Canada, Presence' and p['datesUnchanged'] == '2026-10-31 through 2026-11-06'

validate(rows)
mutations = []
for filename, field, value in [
    ('01-new-ad-groups.csv', 'Default max. CPC', '0.12'),
    ('01-new-ad-groups.csv', 'Target CPA', '100'),
    ('02-new-responsive-search-ads.csv', 'Campaign ID', '24411162375'),
    ('02-new-responsive-search-ads.csv', 'Final URL', 'https://www.getyourguide.com/s/'),
    ('02-new-responsive-search-ads.csv', 'Final URL suffix', 'utm_source=google&utm_medium=cpc&utm_campaign=wrong'),
    ('02-new-responsive-search-ads.csv', 'Headline 1', 'x' * 31),
    ('02-new-responsive-search-ads.csv', 'Ad ID', '830082984184'),
    ('03-new-group-keywords.csv', 'Type', 'Broad match'),
    ('03-new-group-keywords.csv', 'Action', 'Edit'),
    ('03-new-group-keywords.csv', 'Keyword ID', '123'),
    ('03-new-group-keywords.csv', 'Default max. CPC', '0.12'),
    ('04-existing-group-keyword-additions.csv', 'Ad group ID', '999999'),
]:
    if rows[filename]:
        fixture = copy.deepcopy(rows); fixture[filename][0][field] = value; mutations.append((field, fixture))
for filename in ['03-new-group-keywords.csv', '04-existing-group-keyword-additions.csv']:
    if rows[filename]:
        fixture = copy.deepcopy(rows)
        value = fixture[filename][0]['Keyword']
        match_type = fixture[filename][0]['Type']
        fixture[filename][0]['Keyword'] = '[' + value + ']' if match_type == 'Exact match' else '"' + value + '"'
        mutations.append(('plain-term-contract', fixture))
for filename, values in rows.items():
    state_field = 'Ad group status' if filename.startswith('01') else 'Ad status' if filename.startswith('02') else 'Keyword status'
    index = next((i for i, row in enumerate(values) if row[state_field] == 'Paused'), None)
    if index is not None:
        fixture = copy.deepcopy(rows); fixture[filename][index][state_field] = 'Enabled'; mutations.append(('held-family-enable', fixture))
for label, fixture in mutations:
    try:
        validate(fixture)
    except (AssertionError, KeyError, ValueError):
        continue
    raise AssertionError('Unsafe mutation was accepted: ' + label)

expected_counts = {
    'guideFamilies': len(groups), 'readyFamilies': sum(g['launchState'] == 'ready' for g in groups.values()),
    'heldFamilies': sum(g['launchState'] == 'held' for g in groups.values()),
    'newGroups': len(new_family_ids), 'newAds': len(new_family_ids),
    'newGroupKeywords': len(expected_new_terms), 'additionsToExistingGroups': len(expected_existing_terms),
    'exactKeywords': sum(row['Type'] == 'Exact match' for filename in ['03-new-group-keywords.csv', '04-existing-group-keyword-additions.csv'] for row in rows[filename]),
    'phraseKeywords': sum(row['Type'] == 'Phrase match' for filename in ['03-new-group-keywords.csv', '04-existing-group-keyword-additions.csv'] for row in rows[filename]),
    'candidateTermsAlreadyPresent': covered_candidates, 'reusedExistingGroups': len(reuse_ids),
}
assert manifest['counts'] == expected_counts
receipt = {'result': 'PASS_LOCAL_ONLY_NOT_UPLOADED', 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'manifestSha256': digest((folder / 'manifest.json').read_bytes()), 'counts': expected_counts, 'negativeFixtures': len(mutations), 'campaignId': campaign_id, 'networkOrAccountOperations': False}
(folder / 'validation-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
