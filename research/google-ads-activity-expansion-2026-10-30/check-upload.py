"""Offline checks of native web-upload CSVs; no account or network access."""
import csv, hashlib, io, json
from pathlib import Path
from urllib.parse import urlparse, parse_qs
root = Path(__file__).resolve().parent
manifest = json.loads((root/'manifest.json').read_text())
provenance = json.loads((root/'template-provenance.json').read_text())
source = json.loads((root/'source-targets.json').read_text())
expected_id = '24416287886'
expected_name = 'BB | CA | Search | Winter activities | 50GBP test'
targets = {t['groupName']:t for t in source['readyTargets']}
assert len(targets) == 12
assert [t['id'] for t in source['omittedHeldTargets']] == ['johnston-icewalk']
assert {p['id'] for p in source['omittedHeldProducts']} == {'gyg-303298','gyg-303253','gyg-437912','gyg-285990'}
rows_by_type = {}
for item in manifest['files']:
    content = (root/item['file']).read_bytes()
    assert hashlib.sha256(content).hexdigest() == item['sha256']
    reader = csv.DictReader(io.StringIO(content.decode('utf-8'), newline=''))
    assert reader.fieldnames == provenance['templates'][item['template']]['headers']
    rows = list(reader)
    assert len(rows) == item['rows'] and rows
    assert all(None not in row and None not in row.values() for row in rows)
    rows_by_type[item['rowType']] = rows

def validate(rows_by_type):
    assert set(rows_by_type) == {'Ad group','Ad','Keyword'}, 'No Campaign or other object rows.'
    for row_type, rows in rows_by_type.items():
        for row in rows:
            assert row['Row Type'] == row_type and row['Action'] == 'Add'
            assert row['Campaign ID'] == expected_id and row['Campaign'] == expected_name
            assert row['Ad group'] in targets
            assert not row.get('Ad group ID') and not row.get('Ad ID') and not row.get('Keyword ID'), 'No existing object edits.'
            assert not row.get('Tracking template') and not row.get('Custom parameter')
            assert not any(key in row for key in ['Budget','Budget type','Networks','Language','Location','Campaign start date','Campaign end date'])
            status_field = {'Ad group':'Ad group status','Ad':'Ad status','Keyword':'Keyword status'}[row_type]
            assert row[status_field] == 'Enabled'
            if row_type in ['Ad group','Keyword']:
                assert row['Default max. CPC'] == '0.07'
    groups = rows_by_type['Ad group']
    assert len(groups) == 12 and {r['Ad group'] for r in groups} == set(targets)
    assert all(r['Ad group type'] == 'Standard' for r in groups)
    ads = rows_by_type['Ad']
    assert len(ads) == 12 and {r['Ad group'] for r in ads} == set(targets)
    for ad in ads:
        t = targets[ad['Ad group']]
        assert ad['Ad type'] == 'Responsive search ad'
        final = urlparse(ad['Final URL'])
        assert final.scheme == 'https' and final.netloc == 'banffbound.com'
        assert final.path == t['guidePath'] and not final.query and not final.fragment
        assert ad['Final URL'] == t['finalUrl']
        assert not ad['Mobile final URL']
        params = parse_qs(ad['Final URL suffix'], strict_parsing=True)
        assert params == {'utm_source':['google'],'utm_medium':['cpc'],'utm_campaign':['bb_ca_winter_50_test'],'utm_content':['activity_'+t['id'].replace('-','_')+'_rsa']}
        assert ad['Final URL suffix'] == t['finalUrlSuffix']
        heads = [ad['Headline '+str(i)] for i in range(1,16) if ad['Headline '+str(i)]]
        descs = [ad['Description '+str(i)] for i in range(1,5) if ad['Description '+str(i)]]
        assert heads == t['headlines'] and descs == t['descriptions']
        assert 3 <= len(heads) <= 15 and all(0 < len(h) <= 30 for h in heads)
        assert 2 <= len(descs) <= 4 and all(0 < len(d) <= 90 for d in descs)
        assert not any(ad[k] for k in ad if k.endswith(' position')), 'No unintended pinned positions.'
    keywords = rows_by_type['Keyword']
    expected = {(t['groupName'],match,k) for t in targets.values() for match,terms in [('Exact match',t['exactKeywords']),('Phrase match',t['phraseKeywords'])] for k in terms}
    actual = {(r['Ad group'],r['Type'],r['Keyword']) for r in keywords}
    assert actual == expected and len(actual) == len(keywords) == 93
    assert sum(r['Type']=='Exact match' for r in keywords) == 58
    assert sum(r['Type']=='Phrase match' for r in keywords) == 35
    assert all(r['Type'] in ['Exact match','Phrase match'] and not r['Final URL'] and not r['Final URL suffix'] for r in keywords), 'Use explicit match type and the relevant ad destination.'
    assert manifest['authorityAndPreservation']['campaignRows'] == 0
    assert manifest['authorityAndPreservation']['campaignTotalBudgetGBPUnchanged'] == 50
    assert manifest['authorityAndPreservation']['campaignMaximumCpcGBPUnchanged'] == .07
    assert manifest['authorityAndPreservation']['hotelRows'] == 0

validate(rows_by_type)
# Independent business-boundary mutations must fail the same checks.
negative_mutations = [
    ('Ad group', 'Default max. CPC', '0.12'),
    ('Ad', 'Campaign ID', '24411126897'),
    ('Ad', 'Final URL', 'https://www.getyourguide.com/s/'),
    ('Ad', 'Final URL suffix', 'utm_source=google&utm_medium=cpc&utm_campaign=wrong'),
    ('Keyword', 'Type', 'Broad match'),
    ('Keyword', 'Keyword status', 'Paused'),
    ('Ad', 'Headline 1', 'x'*31),
]
for row_type, field, value in negative_mutations:
    mutated = {key:[dict(row) for row in values] for key,values in rows_by_type.items()}
    mutated[row_type][0][field] = value
    try:
        validate(mutated)
    except AssertionError:
        pass
    else:
        raise AssertionError('Negative fixture was incorrectly accepted: '+field)
receipt = {'result':'PASS','scope':'Local CSV, fixed source snapshot and native-template checks only. No provider preview, import, apply, live URL request, serving or conversion verification.', 'campaignId':expected_id, 'counts':manifest['counts'], 'checks':['Native web-template exact header order and SHA256 receipts','Existing campaign ID and name only; Add only; no object IDs','12 ready groups; held Johnston and held products omitted','7p group and keyword bids; zero Campaign/budget/hotel/shared-asset rows','12 clean corresponding guide destinations and exact fixed-cohort suffixes','RSA asset limits and source-copy equality','58 exact and35 phrase keywords; no broad match; no duplicate group/type/term triples'], 'negativeFixtures':len(negative_mutations),'files':manifest['files']}
(root/'validation-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'result':'PASS','counts':manifest['counts'],'negativeFixtures':len(negative_mutations),'campaignId':expected_id},indent=2))
