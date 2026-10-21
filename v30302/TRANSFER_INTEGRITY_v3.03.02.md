# v3.03.02 transfer integrity

Source: `野球メモ_v3.03.02_共有先修正版.zip`

- source `index.html`: 1,923,026 bytes
- gzip: 1,109,837 bytes
- Base64(gzip): 1,479,784 bytes
- chunks: 30
- chunk size: 50,000 bytes
- source SHA-256: `a013afaf63fb7760ccb31f9c69a13b1acae71f9c95c0aae14813a8b291db6463`

Reconstruction test performed locally:

`30 chunks -> concatenate -> Base64 decode -> gzip decompress -> index.html`

Result: **PASS**

Reconstructed SHA-256 equals the source SHA-256: **PASS**

Important: production domain must not be switched until the actual chunk files are present in GitHub/transport and an independent reconstruction from the transported data also passes.
