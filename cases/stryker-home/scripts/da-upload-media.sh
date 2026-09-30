#!/bin/zsh
# da-upload-media.sh — upload every file in media/ (source bytes, unchanged) to DA /drafts/media/<name> and preview it on the branch.
# usage: scripts/da-upload-media.sh [file…]  (default: media/*.{jpg,png,webp})  — needs DA_TOKEN (source ~/.claude/.env)
set -e
ORG=aemcoder-adobe; SITE=sdt-stryker; BRANCH=blocks-first
files=("$@"); [[ ${#files} -eq 0 ]] && files=(media/*.jpg(N) media/*.png(N) media/*.webp(N))
for f in $files; do
  n=$(basename "$f"); [[ "$n" == hero-frame-2x.png ]] && continue
  code=$(/usr/bin/curl -s -o /tmp/da-up.txt -w '%{http_code}' -X PUT "https://admin.da.live/source/$ORG/$SITE/drafts/media/$n" -H "Authorization: Bearer $DA_TOKEN" -F "data=@$f")
  pcode=$(/usr/bin/curl -s -o /tmp/da-pv.txt -w '%{http_code}' -X POST "https://admin.hlx.page/preview/$ORG/$SITE/$BRANCH/drafts/media/$n" -H "Authorization: Bearer $DA_TOKEN")
  echo "$n upload=$code preview=$pcode"
done
