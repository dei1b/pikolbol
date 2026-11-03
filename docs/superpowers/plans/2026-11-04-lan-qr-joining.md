# LAN QR Joining Implementation Plan

**Goal:** Host displays a ready QR code; guests scan inside Rally to join directly, with manual entry retained.

**Architecture:** Bundle QR encoder/decoder locally. Versioned Rally-only payload includes LAN protocol/build, private IPv4 addresses, port and room code. Reuse existing validated join path. Camera via getUserMedia and explicit Android runtime permission limited to trusted origin/video. Cancel, background, navigation and late camera replies stop all tracks. Multiple interfaces get an address selector; failures retain manual fallback.

**Tech stack:** Existing vanilla JavaScript UI, Java WebView; qrcode-generator1.4.4 and jsQR1.4.0 (licenses bundled).

- [x] Test payload validation and QR encode/decode roundtrip; implement site/lan-qr.js and vendored libraries.
- [x] Add host QR/address selection and guest scan/cancel/error UI to site/lan-ui.js; verify camera lifecycle with mocked stream, real QR frames and joins, retaining manual join.
- [x] Add Android camera runtime handling in MainActivity.java and manifest; build, check transport regression and device integration, document limitations and commit.

## Verification

Payload/QR roundtrip, browser host address switching, real QR video-frame auto-join, denied permission/manual fallback, pending camera cancellation and navigation cleanup passed. Existing protocol/native TCP and singles/doubles browser matches passed. Physical Samsung checks passed native host QR decoding, actual Android runtime camera prompt, rear-camera preview and track shutdown. Two physical phones scanning/joining over Wi-Fi were not available for this run. Android2.1.0 installed over existing app. Camera libraries are bundled; no internet dependency.
