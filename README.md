# 野球メモ v1.5

観戦しながら、少ないタップで自チームの野球を記録するブラウザアプリです。

## GitHub + Cloudflare Pages
- Repositoryのルートにこのフォルダ内のファイルを配置
- Branch: `main`
- Framework preset: None / なし
- Build command: 空欄
- Build output directory: `/`

GitHubへpushすると、Cloudflare PagesのGit連携で自動デプロイされます。

## PWA
- HTTPSで公開するとPWAとして利用できます。
- Android/Chrome: ブラウザのインストールUIまたはアプリ内の「ホーム画面に追加」を利用。
- iPhone/iPad: Safariの共有ボタン →「ホーム画面に追加」。

## データ
試合データは端末ブラウザのlocalStorageに保存されます。クラウド同期ではありません。
大切なデータはアプリ内のバックアップ機能でJSON保存してください。
