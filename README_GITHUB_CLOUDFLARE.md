# 西春野球ノート v2.21 — GitHub + Cloudflare Pages

## 1. GitHub
1. GitHubで新規Repositoryを作成（例: `baseball-memo`）。
2. このフォルダ直下のファイルをRepositoryのルートにアップロード。
3. ブランチは `main` にする。

## 2. Cloudflare Pages
Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git。
GitHubをAuthorizeし、`baseball-memo`を選択。

設定:
- Production branch: `main`
- Framework preset: None / なし
- Build command: 空欄
- Build output directory: `/`

Deploy後、`https://<project-name>.pages.dev` が本番URLになります。

## 3. 今後の更新
GitHubの `main` に変更をpush/アップロードすると、Cloudflare Pagesが自動デプロイします。

## 4. 注意
- このアプリの試合データは端末ブラウザのlocalStorageに保存されます。クラウド同期ではありません。
- 大切なデータはアプリのバックアップ機能でJSON保存してください。
