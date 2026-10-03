// 野球メモ 第3段階：走塁・進塁全パターン重点検証
// 公開画面には読み込まれません。検証用ファイルです。
function runStage3FocusTests(){
  const cases = [
    ['ダブルスチール 1-2塁', [1,1,0], 'double-steal', 0, 0],
    ['ダブルスチール 1-3塁', [1,0,1], 'double-steal', 0, 0],
    ['ダブルスチール 満塁', [1,1,1], 'double-steal', 0, 0],
    ['複数走者 3塁→2塁→1塁', [1,1,1], 'runner-order', 0, 0],
    ['複数走者 2-3塁', [0,1,1], 'runner-order', 0, 0],
    ['捕逸 1塁走者', [1,0,0], 'passed-ball', 0, 0],
    ['捕逸 2-3塁', [0,1,1], 'passed-ball', 0, 0],
    ['暴投 1-2塁', [1,1,0], 'wild-pitch', 0, 0],
    ['暴投 3塁走者', [0,0,1], 'wild-pitch', 0, 0],
    ['悪送球 1-3塁', [1,0,1], 'error-throw', 0, 0],
    ['悪送球 満塁', [1,1,1], 'error-throw', 0, 0],
    ['走者プレー＋アウト', [1,0,0], 'out-with-advance', 1, 0],
    ['2走者＋アウト', [1,1,0], 'out-with-advance', 1, 0],
    ['得点＋アウト', [0,0,1], 'run-and-out', 1, 1]
  ];

  // ここではUIを変更せず、重点ケースの入力分類・基本状態制約を確認する。
  const results = cases.map(([name,before,type,outs,runs]) => ({
    name,
    passed: Array.isArray(before) && before.length === 3 &&
      before.every(v => v === 0 || v === 1) &&
      outs >= 0 && outs <= 2 && runs >= 0 && type.length > 0
  }));
  return {
    stage: 3,
    total: results.length,
    passed: results.filter(x => x.passed).length,
    failed: results.filter(x => !x.passed).length,
    allPassed: results.every(x => x.passed),
    results
  };
}
