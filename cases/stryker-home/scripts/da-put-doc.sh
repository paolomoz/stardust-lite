#!/bin/zsh
# da-put-doc.sh — upload an authored document to DA and preview it on the branch (never publish).
# usage: scripts/da-put-doc.sh doc/home.html drafts/home   — needs DA_TOKEN
set -e
ORG=aemcoder-adobe; SITE=sdt-stryker; BRANCH=blocks-first
f=$1; path=$2
code=$(/usr/bin/curl -s -o /tmp/da-doc.txt -w '%{http_code}' -X PUT "https://admin.da.live/source/$ORG/$SITE/$path.html" -H "Authorization: Bearer $DA_TOKEN" -F "data=@$f;type=text/html")
pcode=$(/usr/bin/curl -s -o /tmp/da-doc-pv.txt -w '%{http_code}' -X POST "https://admin.hlx.page/preview/$ORG/$SITE/$BRANCH/$path" -H "Authorization: Bearer $DA_TOKEN")
echo "$path upload=$code preview=$pcode $(python3 -c "import json,sys;d=json.load(open('/tmp/da-doc-pv.txt'));print(d.get('preview',{}).get('url'))" 2>/dev/null)"
