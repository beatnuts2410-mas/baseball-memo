# v3.03.16 transport verification

This is an isolated test branch. Do not merge to main until all checks pass.

## Required input
Upload exactly one ZIP file into this folder:
`v3.03.16-transport/`

Expected ZIP:
- Filename: `v3.03.16_搬送データ検証強化版.zip`
- ZIP SHA-256: `b872801d5d5a8f80df825cdb18a313a7045aa762ec62d7a6eb9a74d43315dd28`
- Contains one HTML file, 2,684,522 bytes
- Extracted HTML SHA-256: `c1e517ce548dba366439090b694e3960e50b13e1c05ac0c009808da38c2b5674`

After the ZIP is committed, GitHub Actions workflow `build-v30316-transport` runs automatically. It checks the exact HTML hash, deterministic gzip/Base64 hashes, then creates 45 chunks of 50,000 characters. A mismatch stops the workflow and does not create a valid chunk set.

## Promotion rule
No production or main-branch change is authorized by this workflow. First verify the generated chunks by reassembling them and matching the source SHA-256. Then compare the live Cloudflare deployment. Only after both pass should a separate production change be considered.
