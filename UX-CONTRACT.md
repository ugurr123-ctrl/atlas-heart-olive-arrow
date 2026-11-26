# Changed workflow ownership

| Capability | Owner | Behavior | Evidence |
|---|---|---|---|
| Board export | assets/board-export.js | Cache PNG then native share; browser Blob download; cancel preserves board | export browser and native bridge checks |
| Premium entitlement | assets/premium-access.js | Native store subscription query, no local unlock flags; refresh on foreground | purchase/restore fixtures and store sandbox pending |
| Premium dialog | VeiraPremiumModal | Native dialog focus/Escape; plans are buttons; inline loading/error; restore and legal links | narrow viewport and keyboard checks |
| Feedback | Existing onShowToast callback | Reuse application toast for completed exports/purchases | browser workflow |
| Free access | isFreeTemplate and Astro tab handler | Three collage templates, daily astrology; existing saved boards remain editable | feature gate checks |

Native store confirmation owns purchase approval. App Store/Play products and subscription approval are release prerequisites. No purchase is simulated when products are unavailable. No new paid gates are to be advertised on the currently submitted free build.
