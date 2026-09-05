# 野球メモ 本番公開手順（Cloudflare Pages）

Cloudflare Pages の Direct Upload は、完成済みの静的ファイルをドラッグ&ドロップまたはCLIで公開できます。

## 1. Cloudflareにログイン
Cloudflareのダッシュボードで Workers & Pages を開きます。

## 2. 新規作成
Create application → Pages → Direct Upload / Drag and drop を選択。

## 3. プロジェクト名
例：`baseball-memo`

公開URLは通常 `https://baseball-memo.pages.dev` の形式になります。名前が使用済みなら別名になります。

## 4. アップロード
このZIPを解凍し、次のファイルをサイト直下の状態でアップロードします。

- index.html
- manifest.webmanifest
- sw.js
- icon-192.png
- icon-512.png

README等は公開サイトに不要なので、アップロード対象から外して構いません。

## 5. 動作確認
HTTPSの公開URLをAndroid ChromeまたはiPhone Safariで開きます。

Android：ブラウザメニュー → ホーム画面に追加 / アプリをインストール

iPhone：共有 → ホーム画面に追加

アイコンが以前のキャッシュになっている場合は、古いショートカットを削除してから再追加してください。

## 6. 更新
Direct Uploadプロジェクトは、同じプロジェクトに新しいファイルをアップロードして更新できます。
将来的にGitHub連携で自動更新したい場合は、最初からGit integration方式で別プロジェクトを作る方が安全です。
