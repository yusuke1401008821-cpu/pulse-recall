# Pulse Recall

ANKI に着想を得た、モバイル向けの暗記サポートアプリの初版プロトタイプです。依存なしの静的 Web アプリとして作ってあるため、まずは素早く触りながら方向性を固められます。

## できること

- デッキ作成
- デッキ編集・削除
- カード追加
- カード編集・削除
- 今日の復習カード表示
- `忘れた / あいまい / 覚えた` に応じた次回復習間隔の調整
- `新規学習 / 学習中 / 定着レビュー / 再学習` の段階管理
- 回答前に次回目安が見える学習ボタン
- 直近7日間の学習履歴グラフと評価内訳
- `localStorage` による端末内保存
- PWA 用の manifest / service worker の同梱

## 起動方法

```bash
python3 -m http.server 4173
```

その後、ブラウザで [http://localhost:4173](http://localhost:4173) を開きます。

## Vercel 公開準備

このプロジェクトは HTML / CSS / JavaScript の静的サイトなので、Vercel では `Other` を選び、`Build Command` を空欄にするとそのまま配信できます。

公開時のおすすめ設定:

- Framework Preset: `Other`
- Build Command: 空欄
- Output Directory: `.` または未設定
- Root Directory: このプロジェクトのルート

公開後に検索へ載せやすくするために、以下は追加済みです。

- `robots.txt`
- PWA 用アイコン
- Open Graph / description 系メタタグ
- `vercel.json` による `sw.js` と manifest の更新向けヘッダー

公開URLが確定したあとにやると良いこと:

- Google Search Console に登録
- 必要なら独自ドメインを設定
- URL 確定後に `sitemap.xml` を追加

## 今後の拡張候補

- 学習履歴グラフ
- ログインとクラウド同期
- 音声読み上げ
- iPhone 向けのホーム画面アイコンやスプラッシュ改善
