#!/bin/bash
# Deploy BanffBound Agents to DigitalOcean App Platform
# Usage: DO_TOKEN=your_token_here bash agents/deploy.sh

if [ -z "$DO_TOKEN" ]; then
  echo "Error: Set DO_TOKEN first"
  echo "Usage: DO_TOKEN=dop_v1_xxx bash agents/deploy.sh"
  exit 1
fi

# Read env values from agents/.env
source agents/.env

curl -s -X POST \
  "https://api.digitalocean.com/v2/apps" \
  -H "Authorization: Bearer $DO_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
  \"spec\": {
    \"name\": \"banffbound-agents-v2\",
    \"region\": \"tor1\",
    \"services\": [{
      \"name\": \"agents\",
      \"dockerfile_path\": \"agents/Dockerfile\",
      \"source_dir\": \"/\",
      \"github\": {
        \"repo\": \"GlobalBookings/banffbound\",
        \"branch\": \"main\",
        \"deploy_on_push\": true
      },
      \"http_port\": 3100,
      \"instance_count\": 1,
      \"instance_size_slug\": \"apps-s-1vcpu-0.5gb\",
      \"routes\": [{\"path\": \"/\"}],
      \"health_check\": {\"http_path\": \"/health\"},
      \"envs\": [
        {\"key\": \"GOOGLE_CLIENT_ID\", \"value\": \"$GOOGLE_CLIENT_ID\", \"type\": \"SECRET\"},
        {\"key\": \"GOOGLE_CLIENT_SECRET\", \"value\": \"$GOOGLE_CLIENT_SECRET\", \"type\": \"SECRET\"},
        {\"key\": \"GOOGLE_REFRESH_TOKEN\", \"value\": \"$GOOGLE_REFRESH_TOKEN\", \"type\": \"SECRET\"},
        {\"key\": \"GOOGLE_ADS_CUSTOMER_ID\", \"value\": \"$GOOGLE_ADS_CUSTOMER_ID\", \"type\": \"SECRET\"},
        {\"key\": \"GOOGLE_ADS_DEVELOPER_TOKEN\", \"value\": \"$GOOGLE_ADS_DEVELOPER_TOKEN\", \"type\": \"SECRET\"},
        {\"key\": \"GOOGLE_ADS_LOGIN_CUSTOMER_ID\", \"value\": \"\", \"type\": \"SECRET\"},
        {\"key\": \"SEARCH_CONSOLE_SITE_URL\", \"value\": \"https://banffbound.com\"},
        {\"key\": \"SLACK_WEBHOOK_URL\", \"value\": \"$SLACK_WEBHOOK_URL\", \"type\": \"SECRET\"},
        {\"key\": \"SITE_URL\", \"value\": \"https://banffbound.com\"},
        {\"key\": \"SITEMAP_URL\", \"value\": \"https://banffbound.com/sitemap-index.xml\"},
        {\"key\": \"APPROVAL_PORT\", \"value\": \"3100\"}
      ]
    }]
  }
}" | python3 -m json.tool

echo ""
echo "Done! Check cloud.digitalocean.com/apps for your new app."
