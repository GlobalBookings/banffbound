#!/usr/bin/env python3
"""Read-only GA4 aggregate archive. No messages, settings writes, raw click IDs or user identifiers."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

PROPERTY_ID = '494425433'
COHORTS = ['bb_ca_winter_50_test', 'bb_ca_hotels_7_day_test']
CUSTOM_PARAMETERS = ['landing_id', 'content_id', 'content_type', 'offer_id', 'placement', 'paid_cohort', 'affiliate_partner']

def load_configuration(env_file=None):
    result = dict(os.environ)
    if env_file:
        for line in Path(env_file).read_text().splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            value = value.strip()
            if len(value) > 1 and value[0] in ['"', "'"] and value[-1] == value[0]:
                value = value[1:-1]
            result.setdefault(key.strip().removeprefix('export '), value)
    return result

def archive_json(directory, data):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    name = 'ga4-history-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '.json'
    target = directory / name
    raw = (json.dumps(data, indent=2) + '\n').encode()
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'wb') as handle:
        handle.write(raw)
    return target, hashlib.sha256(raw).hexdigest()

def completed_dates(time_zone, days, now=None):
    local = (now or datetime.now(timezone.utc)).astimezone(ZoneInfo(time_zone))
    return (local.date() - timedelta(days=days)).isoformat(), (local.date() - timedelta(days=1)).isoformat()

def filter_in(field, values):
    return {'filter': {'fieldName': field, 'inListFilter': {'values': values, 'caseSensitive': True}}}

def safe_error(error, secrets):
    result = {'status': 'unavailable', 'data': None, 'errorType': type(error).__name__}
    if isinstance(error, urllib.error.HTTPError):
        result['httpStatus'] = error.code
        try:
            payload = json.load(error).get('error', {})
            if isinstance(payload, dict):
                result['apiStatus'] = payload.get('status')
                result['reason'] = next((item.get('reason') for item in payload.get('details', []) if item.get('reason')), None)
                message = str(payload.get('message', ''))
            else:
                message = str(payload)
            for secret in secrets:
                if secret and len(secret) > 6:
                    message = message.replace(secret, '[redacted]')
            result['message'] = message[:600]
        except Exception:
            pass
    return result

def capture(configuration, days=28, property_id=PROPERTY_ID):
    snapshot = {'schemaVersion': 1, 'capturedAt': datetime.now(timezone.utc).isoformat(), 'mode': 'READ_ONLY_API', 'propertyId': property_id,
        'measurement': 'Consent-observed GA4 aggregates, not a billing or merchant commission ledger. Public cohort labels do not prove paid clicks.',
        'requests': {}, 'reports': {}}
    secrets = [configuration.get(key, '') for key in ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']]
    try:
        fields = {key: configuration[variable] for key, variable in [('client_id','GOOGLE_CLIENT_ID'), ('client_secret','GOOGLE_CLIENT_SECRET'), ('refresh_token','GOOGLE_REFRESH_TOKEN')]}
        fields['grant_type'] = 'refresh_token'
        request = urllib.request.Request('https://oauth2.googleapis.com/token', data=urllib.parse.urlencode(fields).encode(), headers={'Content-Type':'application/x-www-form-urlencoded'})
        with urllib.request.urlopen(request, timeout=30) as response:
            authentication = json.load(response)
        token = authentication['access_token']
        secrets.append(token)
        snapshot['authentication'] = {'status': 'ok', 'grantedScopes': authentication.get('scope', '').split()}
    except Exception as error:
        snapshot['authentication'] = safe_error(error, secrets)
        return snapshot

    def request(label, url, body=None, section='requests'):
        try:
            data = None if body is None else json.dumps(body).encode()
            req = urllib.request.Request(url, data=data, headers={'Authorization':'Bearer '+token, 'Content-Type':'application/json'})
            with urllib.request.urlopen(req, timeout=45) as response:
                payload = json.load(response)
            result = {'status':'available', 'data':payload}
        except Exception as error:
            result = safe_error(error, secrets)
        snapshot[section][label] = result
        return result

    admin = 'https://analyticsadmin.googleapis.com/'
    for label, version, suffix in [('property','v1beta',''),('dataStreams','v1beta','/dataStreams'),('customDimensions','v1beta','/customDimensions'),('googleAdsLinks','v1beta','/googleAdsLinks'),('dataRetentionSettings','v1alpha','/dataRetentionSettings')]:
        request(label, f'{admin}{version}/properties/{property_id}{suffix}')
    metadata = request('metadata', f'https://analyticsdata.googleapis.com/v1beta/properties/{property_id}/metadata')
    report_url = f'https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport'
    # Relative dates here are interpreted by GA4 itself. Metadata confirms the real
    # property timezone before we calculate absolute completed-day archive ranges.
    probe = request('timezoneProbe', report_url, {'dateRanges':[{'startDate':'yesterday','endDate':'yesterday'}], 'metrics':[{'name':'sessions'}]}, 'reports')
    zone = (probe.get('data') or {}).get('metadata', {}).get('timeZone') or (snapshot['requests']['property'].get('data') or {}).get('timeZone')
    if not zone:
        snapshot['dateRanges'] = {'status':'unavailable', 'reason':'Property timezone not confirmed; no absolute-date reports requested.'}
        return snapshot
    start, end = completed_dates(zone, days)
    snapshot['dateRanges'] = {'status':'available', 'propertyTimeZone':zone, 'lastCompletedDays':{'days':days,'startDate':start,'endDate':end}, 'yearToCompletedYesterday':{'startDate':'2026-01-01','endDate':end}}

    def report(label, since, dimensions, metrics, dimension_filter=None):
        body = {'dateRanges':[{'startDate':since,'endDate':end}], 'dimensions':[{'name':name}for name in dimensions], 'metrics':[{'name':name}for name in metrics], 'limit':10000, 'offset':0}
        if dimension_filter:
            body['dimensionFilter'] = dimension_filter
        rows = []
        while True:
            part = request(label, report_url, body, 'reports')
            if part['status'] != 'available':
                part['partialRowsDiscarded'] = len(rows)
                return part
            payload = part['data']
            batch = payload.get('rows', [])
            rows.extend(batch)
            count = int(payload.get('rowCount', len(rows)))
            if len(rows) >= count:
                payload['rows'] = rows
                payload['rowCount'] = count
                part['complete'] = True
                return part
            if not batch:
                part.update(status='unavailable', data=None, reason='Pagination ended before rowCount; incomplete data is not zero.')
                return part
            body['offset'] = len(rows)

    campaign_filter = filter_in('sessionCampaignName', COHORTS)
    affiliate_filter = filter_in('eventName', ['affiliate_click'])
    both = {'andGroup':{'expressions':[campaign_filter, affiliate_filter]}}
    report('overview28', start, [], ['sessions','totalUsers','screenPageViews','eventCount'])
    report('sessionsByDay2026', '2026-01-01', ['date'], ['sessions','totalUsers','screenPageViews'])
    report('paidLandings28', start, ['date','sessionCampaignName','sessionSource','sessionMedium','landingPage'], ['sessions','totalUsers','engagedSessions'], campaign_filter)
    report('paidAffiliateSessions28', start, ['date','sessionCampaignName','landingPage'], ['sessions','eventCount','totalUsers'], both)
    report('affiliateClicksByPage28', start, ['date','pagePath'], ['eventCount','totalUsers'], affiliate_filter)
    definitions = {item['apiName'] for item in (metadata.get('data') or {}).get('dimensions', [])}
    missing = [name for name in CUSTOM_PARAMETERS if 'customEvent:'+name not in definitions]
    snapshot['customDimensionReadiness'] = {'required':CUSTOM_PARAMETERS, 'missing':missing, 'metadataAvailable':metadata['status']=='available'}
    detail_fields = ['content_id','offer_id','placement','affiliate_partner']
    if metadata['status']=='available' and all('customEvent:'+name in definitions for name in detail_fields):
        report('paidOfferPlacement28', start, ['date','sessionCampaignName','pagePath']+['customEvent:'+name for name in detail_fields], ['eventCount','totalUsers'], both)
    else:
        snapshot['reports']['paidOfferPlacement28'] = {'status':'unavailable','data':None,'reason':'Required custom dimensions are not registered or metadata is unavailable; not zero.'}
    return snapshot

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env-file', help='Optional local dotenv configuration; values are never archived or printed.')
    parser.add_argument('--output-dir', required=True, help='Persistent private operator directory; use research/private/ga4-history locally.')
    parser.add_argument('--days', type=int, default=28)
    parser.add_argument('--property-id', default=PROPERTY_ID)
    args = parser.parse_args()
    if not 1 <= args.days <= 366 or not re.fullmatch(r'\d+', args.property_id):
        parser.error('days must be 1–366 and property-id must be numeric')
    snapshot = capture(load_configuration(args.env_file), args.days, args.property_id)
    target, checksum = archive_json(args.output_dir, snapshot)
    summary = {'path':str(target), 'sha256':checksum, 'authentication':snapshot['authentication']['status'], 'dateRanges':snapshot.get('dateRanges'),
        'requests':{key:{field:value.get(field)for field in ['status','httpStatus','apiStatus','reason']}for key,value in snapshot['requests'].items()},
        'reports':{key:{'status':value['status'],'rowCount':(value.get('data')or{}).get('rowCount'),'complete':value.get('complete')}for key,value in snapshot['reports'].items()},
        'customDimensionReadiness':snapshot.get('customDimensionReadiness')}
    print(json.dumps(summary, indent=2))
    return 0 if snapshot['authentication']['status']=='ok' and snapshot.get('dateRanges',{}).get('status')=='available' else 1

if __name__ == '__main__':
    raise SystemExit(main())
