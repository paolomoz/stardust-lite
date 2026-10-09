#!/bin/bash
# media-fetch --fonts names every Typekit file `l.woff2` (the URL's last path segment) — four faces overwrote each other. Fetch by URL, name by face.
cd "$(dirname "$0")/../../../.."
get() { curl -s -H 'Referer: https://www.si.edu/' -H 'Origin: https://www.si.edu' -o "fonts/$1" -w "$1 %{http_code} %{size_download} %{content_type}\n" "$2"; }
get indivisible-600.woff2 'https://use.typekit.net/af/92f8dc/00000000000000007735eeb6/30/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n6&v=3'
get minion-3-600.woff2 'https://use.typekit.net/af/4ba8a2/0000000000000000773594a0/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3'
get indivisible-400-italic.woff2 'https://use.typekit.net/af/2c8795/00000000000000007735eebd/30/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=i4&v=3'
get indivisible-400.woff2 'https://use.typekit.net/af/9e7dcb/00000000000000007735eebb/30/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n4&v=3'
