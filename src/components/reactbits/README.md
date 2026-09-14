# reactbits/

Local adaptations of the React Bits motion patterns (BlurText, ScrollFloat,
ScrollReveal, Magnet, TiltedCard, FlowingMenu), written against the GSAP
version this project actually installs.

They live here rather than coming from a package so that:

* there is no external CDN or runtime dependency,
* the easing, timing and reduced-motion behaviour match the rest of the site,
* the API cannot drift out from under the app on an upgrade.

Every component in this folder:

* renders normal, readable, selectable text when JavaScript motion is off,
* returns to a finished state under `prefers-reduced-motion: reduce`,
* cleans up its own GSAP context on unmount.
