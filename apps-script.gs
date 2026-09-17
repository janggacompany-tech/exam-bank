/**
 * 응시 결과를 구글 시트에 자동으로 쌓는 스크립트 (Google Apps Script)
 *
 * 설정 방법
 *  1. 구글 시트를 새로 만든다.
 *  2. 메뉴 [확장 프로그램] → [Apps Script] 를 열고, 기본 코드를 지운 뒤 이 파일 내용을 붙여넣고 저장한다.
 *  3. 오른쪽 위 [배포] → [새 배포] → 유형 "웹 앱"
 *       - 실행 사용자: 나
 *       - 액세스 권한: 모든 사용자
 *     → [배포] 를 누르고 권한을 허용한다.
 *  4. 나온 "웹 앱 URL"(https://script.google.com/macros/s/…/exec)을
 *     시험 페이지 관리자 → 설정 → "결과 전송 주소"에 붙여넣고 저장한다.
 *     (배포용이라면 index.html 의 DEFAULT_CONFIG.webhookUrl 에도 같은 값을 넣는다.)
 *
 *  코드를 수정했다면 [배포] → [배포 관리] → 연필 아이콘 → 버전 "새 버전" 으로 다시 배포해야 반영된다.
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('응시결과');
  if (!sh) sh = ss.insertSheet('응시결과');

  var r = JSON.parse(e.postData.contents);
  var header = ['제출일시', '이름', '전화번호', '이메일', '점수', '총문항', '정답률(%)', '판정',
                '레벨1', '레벨2', '레벨3', '레벨4', '레벨5', '소요(초)', '자동제출', '복습 파트', '분류별', '문항별(O/X)', '응시ID'];
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  function lv(L) { return r.byLevel && r.byLevel[L] ? r.byLevel[L].correct + '/' + r.byLevel[L].total : ''; }

  sh.appendRow([
    new Date(r.submittedAt), r.name, r.phone, r.email, r.score, r.total, r.percent,
    r.pass ? '합격' : '불합격', lv(1), lv(2), lv(3), lv(4), lv(5), r.durationSec, r.auto ? 'Y' : 'N',
    r.weak || '', r.topicStats || '',
    (r.answers || []).map(function (a) { return a.id + ':' + (a.correct ? 'O' : 'X'); }).join(' '),
    r.id
  ]);
  return ContentService.createTextOutput('ok');
}

// 브라우저에서 웹 앱 URL을 직접 열었을 때 동작 확인용
function doGet() {
  return ContentService.createTextOutput('exam result collector is running');
}
