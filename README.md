# Impact 2025–'26 — Universiteit van Vlaanderen

Een scrollbare, geanimeerde one-pager die de impactcijfers (rvb, januari 2026) van
seizoen 9 presenteert. Gebouwd op de gedeelde UvNL/UvVL-huisstijl (Varsity Green op
Paper, Oldschool Grotesk Condensed, paarse en gele accenten, collage-3D-elementen).

## Bekijken
- Open `index.html` via een lokale webserver (de fonts laden het mooist via http,
  niet via `file://`). Bijvoorbeeld: `npx http-server . -p 8099 -c-1` en ga naar
  `http://localhost:8099`.
- Of gebruik de Launch-preview (zie `.claude/launch.json`, config **impact**).

## Structuur
```
index.html              # de pagina
assets/css/style.css    # tokens, secties, animaties
assets/js/main.js       # scroll-progress, reveals, count-up, donuts, groeibalken
assets/fonts/           # Oldschool Grotesk (+Condensed), Tiempos Text
assets/img/logos/       # UvVL-wordmark, U-merk, vaandel
assets/img/3d/           # speelse discipline-3D-objecten (verkleind voor web)
assets/img/icons/       # spark, bliksem, pijl, snaps, circle (brand-ornamenten)
```

## Secties
1. **Hero** — kop "Een jaar wetenschap in cijfers" + statistiekbalk (90 producties · 2,5 miljoen kijk- & luistercijfers · 6,4 miljoen shorts-views · 5 universiteiten)
2. **Producties** — 90 producties, 4 formats met verdeling per universiteit
3. **Verdeling per universiteit** — geanimeerde donut (VUB 22,4% · UA 20,8% · UG 20,4% · KUL 18,3% · UH 18,1%)
4. **Longform bereik** — video 923.000 (−26%) vs podcast 1.600.000 (+33%)
5. **Shorts** — 6,4 miljoen views, groeibalken per kanaal (Sterkste stijgers / Maar stijgend)
6. **Publiek** — man/vrouw 57% / 43%
7. **Distributie & pers** — De Vooruitblik, nieuwsbrief (12K, 40–50%), VRT, pers
8. **CTA + footer** — link naar universiteitvanvlaanderen.be

## Let op (te verifiëren met de rvb-bron)
- **Videocolleges**: de PDF noemt **25**, maar de opgegeven verdeling
  (4 UA · 8 UH · 5 UG · 2 VUB · 5 KUL) telt op tot **24**. Beide zijn 1-op-1
  overgenomen uit de bron — controleer welk getal klopt.
- **De Vooruitblik**: kop zegt **23 afleveringen**, de verdeling (8/8/8/11/10)
  is een ander aantal — overgenomen zoals in de bron.
- Alle cijfers zijn "onvolledig" zoals aangegeven in de bron (periode 1/9/25–6/6/26).
- Linkjes (site, socials) wijzen naar de publieke UvVL-kanalen; pas aan waar nodig.
