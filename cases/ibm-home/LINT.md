# David's Model lint at step 2 (before any block existed) — 2026-09-30 17:59 CEST

```
== lint doc/home.html
🟡 D1 doc/home.html: section (unnamed) → block "hero": single-column, 3-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/nav.html
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/footer.html
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
```

home: 0 🔴, 1 🟡 — D1 "hero: single-column, 3-row block holding only prose" is the Block Collection hero shape (text row · media row ·
aside row). The block is a genuine widget: it builds the muted autoplay `<video>` with its pause toggle from the authored mp4 link and
poster, and paginates the "Latest News" link list two at a time (four pages). Justified, kept. nav, footer: clean.

Unchanged afterwards: the document was edited three times after step 2 (the tiles section got `style: bleed`; the video link moved from
the DA media path to the code-bus `/media/` path — the pipeline serves an uploaded mp4 as `application/octet-stream`, which Chrome's
`<video>` refuses; the poster swapped to the source's 672 px Kaltura thumbnail, see REGISTER.md). The harness re-ran the same lint on
every round: same result (0 🔴, 1 🟡).
