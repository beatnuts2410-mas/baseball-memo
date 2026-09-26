# 野球メモ v3.01.5 — 走塁・進塁画面 上部固定・初期表示修正版

## 修正
- v3.01.4で追加した `.runnerModal { display:flex!important; }` が、HTMLの初期 `style="display:none"` を上書きしていた問題を修正。
- `.runnerModal[style*="display:none"] { display:none!important; }` を追加し、JavaScriptが明示的に開くまで全モーダルを非表示に固定。
- 盗塁・捕逸・暴投・ボークの走者プレー、打席後の走者確認、アウト数修正等の既存モーダル初期状態を維持。
- 走塁・進塁画面の上部固定、縦スクロール可能な設計は維持。
- 進塁ロジック、走者状態、得点、アウト計算、既存タップ処理は変更していない。

## 構成確認
- ZIP展開後のルート直下に `index.html` と必要画像を配置。
- 起動HTMLから相対パスで `home-bg.png` 等を参照。
- v3.01.5で実際に編集対象をルート直下の `index.html` に統一。

## 検証
- 全インラインJavaScriptを抽出して `node --check` による構文チェックを実施。
- `runnerMoveModal`, `runnerConfirmModal`, `outsAdjustModal`, `runnerCorrectionModal`, `paCorrectionModal` は初期HTMLで `style="display:none"` を持つことを確認。
- v3.01.4の `display:flex!important` による初期表示上書きをCSSで打ち消すことを確認。
