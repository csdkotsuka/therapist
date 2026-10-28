import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

async function generatePitchDeck() {
  const pptx = new pptxgen();

  // 16:9 ワイド画面定義 (13.333 x 7.5 インチ = 1920x1080 相当)
  pptx.defineLayout({ name: 'WIDE_16_9', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE_16_9';
  pptx.author = '大塚 和宏 / yaShine';
  pptx.company = 'CareKuru';
  pptx.subject = 'CareKuru 5分ピッチデック（プロフェッショナルの解放）';
  pptx.title = 'CareKuru ピッチデック';

  const FONT_SERIF = 'Hiragino Mincho ProN';
  const FONT_SANS = 'Hiragino Sans';
  const COLOR_BG = 'F4F9FB';
  const COLOR_TEXT = '0F172A';
  const COLOR_ROSE = 'E11D48';
  const COLOR_SKY = '0284C7';
  const COLOR_EMERALD = '059669';
  const COLOR_GOLD = 'D97706';
  const COLOR_MUTED = '64748B';

  // 共通ヘッダー・フッター描画関数
  function addCommonHeaderFooter(slide, slideIndex) {
    // スライド背景（心地よい淡いペールトーン）
    slide.background = { color: COLOR_BG };

    // 柔らかな装飾背景（最上部アクセントバー）
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.1,
      fill: { color: 'CBD5E1' },
      line: { type: 'none' },
    });

    // ヘッダー: CareKuru ブランドアイコン（角丸）
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 0.45,
      w: 0.42,
      h: 0.42,
      rectRadius: 0.1,
      fill: { color: COLOR_EMERALD },
      line: { type: 'none' },
    });
    slide.addText('CareKuru', {
      x: 1.35,
      y: 0.45,
      w: 3.0,
      h: 0.42,
      fontSize: 18,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      valign: 'middle',
    });

    // ヘッダー: ページ番号
    slide.addText(`${slideIndex}/6`, {
      x: 11.0,
      y: 0.45,
      w: 1.5,
      h: 0.42,
      fontSize: 16,
      bold: true,
      color: COLOR_MUTED,
      fontFace: FONT_SANS,
      align: 'right',
      valign: 'middle',
    });

    // ヘッダー下ライン
    slide.addShape(pptx.shapes.LINE, {
      x: 0.8,
      y: 0.98,
      w: 11.733,
      h: 0,
      line: { color: 'CBD5E1', width: 1 },
    });

    // フッターライン
    slide.addShape(pptx.shapes.LINE, {
      x: 0.8,
      y: 6.85,
      w: 11.733,
      h: 0,
      line: { color: 'CBD5E1', width: 1 },
    });

    // フッターテキスト
    slide.addText('CareKuru ｜ 大塚 和宏 / yaShine ｜ プロフェッショナル連合軍構想', {
      x: 0.8,
      y: 6.9,
      w: 9.0,
      h: 0.4,
      fontSize: 11,
      color: COLOR_MUTED,
      fontFace: FONT_SANS,
      valign: 'middle',
    });

    slide.addText(`SLIDE ${slideIndex} OF 6`, {
      x: 10.0,
      y: 6.9,
      w: 2.533,
      h: 0.4,
      fontSize: 11,
      bold: true,
      color: COLOR_MUTED,
      fontFace: FONT_SANS,
      align: 'right',
      valign: 'middle',
    });
  }

  // ===================================================================
  // SLIDE 1: プロフェッショナルの解放。
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 1);

    // タイトル
    slide.addText([
      { text: 'プロフェッショナルの\n', options: { fontSize: 50, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
      { text: '解放。', options: { fontSize: 62, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
    ], {
      x: 1.0,
      y: 1.7,
      w: 7.8,
      h: 2.3,
      valign: 'middle',
    });

    // 登壇者
    slide.addText('大塚 和宏 / yaShine', {
      x: 1.0,
      y: 4.1,
      w: 6.0,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '334155',
      fontFace: FONT_SERIF,
    });

    // 右側装飾（ダイヤモンド・クリスタルシェイプ）
    slide.addShape(pptx.shapes.DIAMOND, {
      x: 9.2,
      y: 1.8,
      w: 2.8,
      h: 2.8,
      fill: { color: 'E0F2FE' },
      line: { color: '38BDF8', width: 2.5 },
    });
    slide.addShape(pptx.shapes.DIAMOND, {
      x: 9.75,
      y: 2.35,
      w: 1.7,
      h: 1.7,
      fill: { color: 'FCE7F3' },
      line: { color: 'F472B6', width: 2 },
    });
    slide.addText('✦', {
      x: 9.2,
      y: 1.8,
      w: 2.8,
      h: 2.8,
      fontSize: 48,
      color: COLOR_GOLD,
      align: 'center',
      valign: 'middle',
    });

    // 下部バナー
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 5.0,
      w: 11.333,
      h: 1.25,
      rectRadius: 0.25,
      fill: { color: 'FFFFFF' },
      line: { color: 'FDE68A', width: 2 },
    });
    slide.addText('医療・美・健康の常識を覆す「プロフェッショナル連合軍」構想', {
      x: 1.0,
      y: 5.0,
      w: 11.333,
      h: 1.25,
      fontSize: 22,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SERIF,
      align: 'center',
      valign: 'middle',
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 自己紹介は端的に力強く：「大塚和宏です。CareKuruを通じて理学療法士、エステ、整体、トレーナーすべてのプロを解放する話をしに来ました。」\n' +
      '▶ 「医療・美・健康の分断を壊し、誰もが本物の技術で正当に報われる未来を全員で創りましょう！」'
    );
  }

  // ===================================================================
  // SLIDE 2: 本物の技術を持つプロが報われないのか？
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 2);

    // 見出し
    slide.addText([
      { text: '本物の技術を持つプロが ', options: { fontSize: 36, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
      { text: '報われないのか？', options: { fontSize: 36, bold: true, color: COLOR_ROSE, fontFace: FONT_SERIF } },
    ], {
      x: 1.0,
      y: 1.2,
      w: 11.333,
      h: 0.8,
      valign: 'middle',
    });

    // 左カード: 医療職の現実
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 2.15,
      w: 5.4,
      h: 3.45,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'FECDD3', width: 2 },
    });
    // 左カードヘッダー
    slide.addText('医療職の現実', {
      x: 1.3,
      y: 2.35,
      w: 4.8,
      h: 0.6,
      fontSize: 21,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      valign: 'middle',
    });
    slide.addShape(pptx.shapes.LINE, {
      x: 1.3,
      y: 3.0,
      w: 4.8,
      h: 0,
      line: { color: 'FFE4E6', width: 1 },
    });
    // 左カード箇条書き
    slide.addText([
      { text: '✔  国家資格で超・安定\n\n', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
      { text: '✔  給料も安定\n\n', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
      { text: '✔  でもスキルを活かし切れない', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
    ], {
      x: 1.4,
      y: 3.25,
      w: 4.6,
      h: 2.1,
      fontFace: FONT_SANS,
      valign: 'top',
    });

    // 右カード: サロン・整体の現実
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.933,
      y: 2.15,
      w: 5.4,
      h: 3.45,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });
    // 右カードヘッダー
    slide.addText('サロン・整体の現実', {
      x: 7.233,
      y: 2.35,
      w: 4.8,
      h: 0.6,
      fontSize: 21,
      bold: true,
      color: COLOR_SKY,
      fontFace: FONT_SANS,
      valign: 'middle',
    });
    slide.addShape(pptx.shapes.LINE, {
      x: 7.233,
      y: 3.0,
      w: 4.8,
      h: 0,
      line: { color: 'E0F2FE', width: 1 },
    });
    // 右カード箇条書き
    slide.addText([
      { text: '✔  技術があっても集客が難しい\n\n', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
      { text: '✔  無資格でも働ける\n\n', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
      { text: '✔  「誰を信じればいいか分からない」', options: { fontSize: 17, bold: true, color: COLOR_TEXT } },
    ], {
      x: 7.333,
      y: 3.25,
      w: 4.6,
      h: 2.1,
      fontFace: FONT_SANS,
      valign: 'top',
    });

    // 下部ピル
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.666,
      y: 5.9,
      w: 6.0,
      h: 0.68,
      rectRadius: 0.34,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 1.5 },
    });
    slide.addText('技術があっても、選ばれにくい', {
      x: 3.666,
      y: 5.9,
      w: 6.0,
      h: 0.68,
      fontSize: 18,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 「国家資格があっても組織の中でスキルを活かしきれない医療職。確かな技術があるのに安売り競争と信用の壁に苦しむサロン・整体職。」\n' +
      '▶ 「どちらも本物なのに、顧客からは選ばれにくい。この理不尽な構造を放置していいはずがありません。」'
    );
  }

  // ===================================================================
  // SLIDE 3: 「治す」医療 × 「癒やし・美」サロンが手を組む必然性
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 3);

    // 見出し（1行でスッキリ表示）
    slide.addText([
      { text: '「治す」', options: { fontSize: 33, bold: true, color: COLOR_SKY, fontFace: FONT_SERIF } },
      { text: '医療 × ', options: { fontSize: 33, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
      { text: '「癒やし・美」', options: { fontSize: 33, bold: true, color: COLOR_ROSE, fontFace: FONT_SERIF } },
      { text: 'サロンが手を組む必然性', options: { fontSize: 33, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
    ], {
      x: 1.0,
      y: 1.2,
      w: 11.333,
      h: 0.8,
      valign: 'middle',
    });

    // 3つの枠（横幅を大きく拡張・均等配置）
    const cardW = 3.35;
    const cardH = 3.4;
    const startY = 2.25;

    // 1: 医療職の力
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'FECDD3', width: 2 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 2.175,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fill: { color: 'FFE4E6' },
      line: { color: 'FDA4AF', width: 1 },
    });
    slide.addText('🏥', {
      x: 2.175,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fontSize: 24,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('医療職の力', {
      x: 1.1,
      y: startY + 1.6,
      w: 3.15,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('安心・安全', {
      x: 1.1,
      y: startY + 2.25,
      w: 3.15,
      h: 0.5,
      fontSize: 17,
      bold: true,
      color: '475569',
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // ✕ 記号 1
    slide.addText('✕', {
      x: 4.4,
      y: startY + 1.2,
      w: 0.55,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '94A3B8',
      align: 'center',
      valign: 'middle',
    });

    // 2: サロンの魅力
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.991,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 6.166,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fill: { color: 'E0F2FE' },
      line: { color: '7DD3FC', width: 1 },
    });
    slide.addText('👥', {
      x: 6.166,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fontSize: 24,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('サロンの魅力', {
      x: 5.091,
      y: startY + 1.6,
      w: 3.15,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_SKY,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('癒やし・美・健康', {
      x: 5.091,
      y: startY + 2.25,
      w: 3.15,
      h: 0.5,
      fontSize: 17,
      bold: true,
      color: '475569',
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // ✕ 記号 2
    slide.addText('✕', {
      x: 8.391,
      y: startY + 1.2,
      w: 0.55,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '94A3B8',
      align: 'center',
      valign: 'middle',
    });

    // 3: プロの連合軍
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.983,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: '34D399', width: 3 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 10.158,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fill: { color: 'D1FAE5' },
      line: { color: '6EE7B7', width: 1 },
    });
    slide.addText('🤝', {
      x: 10.158,
      y: startY + 0.35,
      w: 1.0,
      h: 1.0,
      fontSize: 24,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('プロの連合軍', {
      x: 9.083,
      y: startY + 1.6,
      w: 3.15,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_EMERALD,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('最強のチーム', {
      x: 9.083,
      y: startY + 2.25,
      w: 3.15,
      h: 0.5,
      fontSize: 17,
      bold: true,
      color: COLOR_EMERALD,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // 下部バナー
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.166,
      y: 5.9,
      w: 9.0,
      h: 0.72,
      rectRadius: 0.2,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 1.5 },
    });
    slide.addText('今、動くことで、未来の安定と自由が手に入る！', {
      x: 2.166,
      y: 5.9,
      w: 9.0,
      h: 0.72,
      fontSize: 19,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 「医療の圧倒的な安心・安全と、サロンの癒やし・美・健康。この2つが分断されているから顧客は迷子になります。」\n' +
      '▶ 「手を組むのは必然です。タッグを組むことで、未来の安定と自由を同時に手に入れましょう。」'
    );
  }

  // ===================================================================
  // SLIDE 4: 今こそ、船に乗るべきなのか？【 3大実利 】
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 4);

    // 見出し
    slide.addText([
      { text: '今こそ、船に乗るべきなのか？ ', options: { fontSize: 34, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
      { text: '【 3大実利 】', options: { fontSize: 34, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
    ], {
      x: 1.0,
      y: 1.2,
      w: 11.333,
      h: 0.8,
      valign: 'middle',
    });

    const cardW = 3.5;
    const cardH = 3.4;
    const startY = 2.25;

    // ① 最高級の下駄を履く
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'FECDD3', width: 2 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 2.45,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fill: { color: COLOR_ROSE },
      line: { type: 'none' },
    });
    slide.addText('1', {
      x: 2.45,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    slide.addText('📈', {
      x: 1.0,
      y: startY + 1.05,
      w: cardW,
      h: 0.8,
      fontSize: 36,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('最高級の\n下駄を履く', {
      x: 1.0,
      y: startY + 2.0,
      w: cardW,
      h: 1.1,
      fontSize: 22,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // ② 顧客の相互紹介ループ
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.916,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 6.366,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fill: { color: COLOR_SKY },
      line: { type: 'none' },
    });
    slide.addText('2', {
      x: 6.366,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    slide.addText('👥', {
      x: 4.916,
      y: startY + 1.05,
      w: cardW,
      h: 0.8,
      fontSize: 36,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('顧客の\n相互紹介ループ', {
      x: 4.916,
      y: startY + 2.0,
      w: cardW,
      h: 1.1,
      fontSize: 22,
      bold: true,
      color: COLOR_SKY,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // ③ 初期・月額0円 高還元
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.833,
      y: startY,
      w: cardW,
      h: cardH,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'A7F3D0', width: 2 },
    });
    slide.addShape(pptx.shapes.OVAL, {
      x: 10.283,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fill: { color: COLOR_EMERALD },
      line: { type: 'none' },
    });
    slide.addText('3', {
      x: 10.283,
      y: startY + 0.35,
      w: 0.6,
      h: 0.6,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    slide.addText('¥', {
      x: 8.833,
      y: startY + 1.05,
      w: cardW,
      h: 0.8,
      fontSize: 44,
      bold: true,
      color: COLOR_EMERALD,
      align: 'center',
      valign: 'middle',
    });
    slide.addText('初期・月額0円\n高還元', {
      x: 8.833,
      y: startY + 2.0,
      w: cardW,
      h: 1.1,
      fontSize: 22,
      bold: true,
      color: COLOR_EMERALD,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // 下部リボン Next Step
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.666,
      y: 5.9,
      w: 6.0,
      h: 0.72,
      rectRadius: 0.36,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 2 },
    });
    slide.addText([
      { text: 'Next Step  ➔  ', options: { fontSize: 18, bold: true, color: COLOR_GOLD, fontFace: FONT_SERIF, italic: true } },
      { text: '動く人が未来を創る', options: { fontSize: 19, bold: true, color: COLOR_TEXT, fontFace: FONT_SANS } },
    ], {
      x: 3.666,
      y: 5.9,
      w: 6.0,
      h: 0.72,
      align: 'center',
      valign: 'middle',
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 「実利は極めて明快です。最高級のブランドステータス、顧客の相互紹介ループ、そして初期・月額0円の高還元。」\n' +
      '▶ 「リスクはありません。傍観者になるのではなく、今動く人が次の時代を創ります。」'
    );
  }

  // ===================================================================
  // SLIDE 5: 会長と400人の仲間だから起こせる業界革命
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 5);

    // 見出し
    slide.addText('会長と400人の仲間だから 起こせる業界革命', {
      x: 1.0,
      y: 1.2,
      w: 11.333,
      h: 0.8,
      fontSize: 34,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SERIF,
      valign: 'middle',
    });

    // 左カード: 施術ができるプロ
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 2.2,
      w: 5.4,
      h: 3.4,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'FECDD3', width: 2 },
    });
    slide.addText('施術ができるプロ', {
      x: 1.4,
      y: 2.45,
      w: 4.6,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      valign: 'middle',
    });
    slide.addText('健康的に長生き\n美しくあり続ける', {
      x: 1.4,
      y: 3.25,
      w: 4.6,
      h: 1.8,
      fontSize: 20,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      valign: 'top',
    });

    // 右カード: 経営者・リーダーへ
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.933,
      y: 2.2,
      w: 5.4,
      h: 3.4,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });
    slide.addText('経営者・リーダーへ', {
      x: 7.333,
      y: 2.45,
      w: 4.6,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: COLOR_SKY,
      fontFace: FONT_SANS,
      valign: 'middle',
    });
    slide.addText('ご自身・ご家族、\nそして大切な社員の\n健康と美を守る', {
      x: 7.333,
      y: 3.25,
      w: 4.6,
      h: 1.8,
      fontSize: 20,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      valign: 'top',
    });

    // 下部ピル: 創業パートナー相談デスク
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.166,
      y: 5.85,
      w: 9.0,
      h: 0.72,
      rectRadius: 0.36,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 1.5 },
    });
    slide.addText('⛵ エリア管理や運営側に興味がある方は まずは「創業パートナー相談デスク」へ！', {
      x: 2.166,
      y: 5.85,
      w: 9.0,
      h: 0.72,
      fontSize: 16,
      bold: true,
      color: COLOR_ROSE,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 「この規模とスピードは、会長と400人の仲間が集まった今だからこそ実現できます。」\n' +
      '▶ 「施術者は腕一本で自立し、経営者は社員の健康と美を守る福利厚生として使う。全員に役割があります。」'
    );
  }

  // ===================================================================
  // SLIDE 6: 最初の乗組員として、業界の常識をひっくり返そう！
  // ===================================================================
  {
    const slide = pptx.addSlide();
    addCommonHeaderFooter(slide, 6);

    // 見出し
    slide.addText([
      { text: '最初の乗組員として、 業界の常識を', options: { fontSize: 34, bold: true, color: COLOR_TEXT, fontFace: FONT_SERIF } },
      { text: 'ひっくり返そう！', options: { fontSize: 34, bold: true, color: COLOR_ROSE, fontFace: FONT_SERIF } },
    ], {
      x: 1.0,
      y: 1.2,
      w: 11.333,
      h: 0.8,
      valign: 'middle',
    });

    // 2つのピル（健康長生き ＆ 仲間と共に成長）
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 2.15,
      w: 5.4,
      h: 1.15,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'FECDD3', width: 2 },
    });
    slide.addText('🚶 健康的に長生き', {
      x: 1.0,
      y: 2.15,
      w: 5.4,
      h: 1.15,
      fontSize: 22,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.933,
      y: 2.15,
      w: 5.4,
      h: 1.15,
      rectRadius: 0.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });
    slide.addText('🤝 仲間と共に成長', {
      x: 6.933,
      y: 2.15,
      w: 5.4,
      h: 1.15,
      fontSize: 22,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      align: 'center',
      valign: 'middle',
    });

    // 下部エリア: 船と海 ＋ 先行登録
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 3.55,
      w: 11.333,
      h: 2.95,
      rectRadius: 0.25,
      fill: { color: 'FFFFFF' },
      line: { color: 'BAE6FD', width: 2 },
    });

    // メッセージ
    slide.addText([
      { text: '一緒に 未来を創りましょう！\n', options: { fontSize: 32, bold: true, color: '0C4A6E', fontFace: FONT_SERIF } },
      { text: 'CareKuru プロフェッショナル解放プロジェクト\n\n⛵ 帆を上げ、新しい航海へ', options: { fontSize: 16, bold: true, color: COLOR_SKY, fontFace: FONT_SANS } },
    ], {
      x: 1.5,
      y: 3.85,
      w: 6.5,
      h: 2.3,
      valign: 'middle',
    });

    // 右側: 創業パートナー先行登録QR枠
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.5,
      y: 3.8,
      w: 3.4,
      h: 2.45,
      rectRadius: 0.2,
      fill: { color: 'F0F9FF' },
      line: { color: 'BAE6FD', width: 1.5 },
    });
    slide.addText('創業パートナー先行登録', {
      x: 8.5,
      y: 3.95,
      w: 3.4,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: COLOR_TEXT,
      fontFace: FONT_SANS,
      align: 'center',
    });
    slide.addText('★各地域・ジャンル限定枠', {
      x: 8.5,
      y: 4.35,
      w: 3.4,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: COLOR_EMERALD,
      fontFace: FONT_SANS,
      align: 'center',
    });

    // QRコード画像（URL指定で埋め込み可能）
    slide.addImage({
      path: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https%3A%2F%2Ftherapist.kotsuka-folio.workers.dev%2Fguide%2Fadmin%23partner-registration',
      x: 9.45,
      y: 4.75,
      w: 1.5,
      h: 1.5,
    });

    slide.addNotes(
      '【登壇メモ・語るポイント】\n' +
      '▶ 「最初の乗組員として、この船に乗ってください。業界の常識を、一緒にひっくり返しましょう！」\n' +
      '▶ 「QRコードから先行登録をお願いします。皆様と一緒に未来を創れることを楽しみにしています！」'
    );
  }

  // ファイル出力
  const outputPath = path.resolve('public/CareKuru_PitchDeck_16x9.pptx');
  const rootOutputPath = path.resolve('CareKuru_PitchDeck_16x9.pptx');

  await pptx.writeFile({ fileName: outputPath });
  fs.copyFileSync(outputPath, rootOutputPath);

  console.log(`✅ PowerPoint / Keynote用スライドファイルが正常に生成されました:`);
  console.log(`📁 1: ${outputPath}`);
  console.log(`📁 2: ${rootOutputPath}`);
}

generatePitchDeck().catch((err) => {
  console.error('Error generating pitch deck:', err);
  process.exit(1);
});
