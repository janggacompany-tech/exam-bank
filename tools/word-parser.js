// 장가컴퍼니 문제지(Word) 텍스트 → 문항 배열 파서
// index.html 안의 parseWordText 와 같은 로직입니다. (브라우저/노드 공용)
(function (root) {
  const SYMS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

  function parseWordText(text, level) {
    const lines = String(text).split(/\r?\n/).map(l => l.replace(/ /g, ' ').trim()).filter(Boolean);
    const questions = [];   // {num, q, choices, topic}
    const answers = {};     // num -> 0-based index
    const problems = [];
    let cur = null, topic = '', mode = 'q', pendingNum = null;

    for (const line of lines) {
      if (mode === 'q') {
        if (/정답표/.test(line) && !/^•/.test(line)) { mode = 'a'; continue; }
        let m;
        if ((m = line.match(/^(\d{2,3})\s*[–\-~]\s*(\d{2,3})\s+(.+)$/))) { topic = m[3].trim(); continue; }
        if (/^[━─=]{3,}$/.test(line)) continue;
        if ((m = line.match(/^(\d{1,3})\.\s*(.+)$/)) && (+m[1] === questions.length + 1)) {
          cur = { num: +m[1], q: m[2].trim(), choices: [], topic };
          questions.push(cur); continue;
        }
        if ((m = line.match(/^([①②③④⑤⑥⑦⑧⑨])\s*(.*)$/))) {
          if (!cur) { problems.push(`문항 밖의 보기: "${line.slice(0, 40)}"`); continue; }
          const idx = SYMS.indexOf(m[1]);
          if (idx !== cur.choices.length) problems.push(`${cur.num}번: 보기 순서가 어긋남 (${m[1]})`);
          cur.choices.push(m[2].trim()); continue;
        }
        if (cur) {
          if (cur.choices.length) cur.choices[cur.choices.length - 1] += ' ' + line;
          else cur.q += '\n' + line;
        }
      } else {
        let m;
        if ((m = line.match(/^(\d{1,3})$/))) { pendingNum = +m[1]; continue; }
        if ((m = line.match(/^([①②③④⑤⑥⑦⑧⑨])/)) && pendingNum != null) { answers[pendingNum] = SYMS.indexOf(m[1]); pendingNum = null; continue; }
        if ((m = line.match(/^(\d{1,3})\s*[.:)]?\s*([①②③④⑤⑥⑦⑧⑨])/))) { answers[+m[1]] = SYMS.indexOf(m[2]); pendingNum = null; continue; }
      }
    }

    const out = [];
    questions.forEach(qq => {
      const a = answers[qq.num];
      if (qq.choices.length < 2) return problems.push(`${qq.num}번: 보기가 ${qq.choices.length}개뿐입니다.`);
      if (a == null) return problems.push(`${qq.num}번: 정답표에 답이 없습니다.`);
      if (a >= qq.choices.length) return problems.push(`${qq.num}번: 정답(${SYMS[a]})이 보기 개수를 넘습니다.`);
      out.push({ id: '', level, q: qq.q, choices: qq.choices, answer: a, explain: '', topic: qq.topic });
    });
    if (!questions.length) problems.push('문항을 찾지 못했습니다. "1. 문제 …" 형식과 ①~⑤ 보기, 문서 끝의 정답표가 필요합니다.');
    return { questions: out, problems, found: questions.length, answered: Object.keys(answers).length };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { parseWordText };
  else root.parseWordText = parseWordText;
})(typeof window !== 'undefined' ? window : globalThis);
