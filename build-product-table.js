#!/usr/bin/env node
/**
 * SAMSUN 홈페이지 - 제품 테이블 자동 동기화 스크립트
 * 
 * 사용 방법:
 *   1. index.html 의 PRODUCT_DATA 배열을 수정 (제품 추가/삭제/변경)
 *   2. 터미널에서 실행: node build-product-table.js
 *   3. index.html 의 <tbody id="productTableBody"> 안에 데이터가 자동으로 박힘
 *   4. git add index.html && git commit && git push
 * 
 * 효과:
 *   - 검색엔진(Google, Naver)이 JavaScript 실행 없이도 16개 모델을 인식
 *   - 초기 페이지 로드 시 표가 즉시 표시 (체감 속도 향상)
 *   - 사용자 클릭 시 기존 JS가 그대로 동작 (검색/필터/상세보기 정상)
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'index.html');

console.log('📖 index.html 읽는 중...');
const html = fs.readFileSync(HTML_PATH, 'utf-8');

// 1) PRODUCT_DATA 배열 추출
console.log('🔍 PRODUCT_DATA 배열 파싱 중...');
const dataMatch = html.match(/const PRODUCT_DATA\s*=\s*(\[[\s\S]*?\n\];)/);
if (!dataMatch) {
  console.error('❌ PRODUCT_DATA 배열을 찾을 수 없습니다.');
  process.exit(1);
}

// eval로 PRODUCT_DATA 객체화 (이 스크립트는 신뢰된 환경에서만 실행)
let PRODUCT_DATA;
try {
  PRODUCT_DATA = eval(dataMatch[1].replace(/;$/, ''));
} catch (e) {
  console.error('❌ PRODUCT_DATA 파싱 실패:', e.message);
  process.exit(1);
}

console.log(`✅ ${PRODUCT_DATA.length}개 제품 데이터 발견`);

// 2) statusBadge 함수 (index.html JS 와 동일한 로직)
function statusBadge(status) {
  const isStock = status.includes('재고');
  const bg = isStock ? '#e6f4ea' : '#fff4e0';
  const fg = isStock ? '#1e7c3a' : '#b87a00';
  return `<span style="background:${bg};color:${fg};font-size:12px;font-weight:700;padding:4px 10px;">${status}</span>`;
}

// 3) 각 행(<tr>) 생성 (JS 의 renderTable 함수와 동일한 HTML)
const rowsHtml = PRODUCT_DATA.map((p, i) => {
  const bg = i % 2 === 1 ? 'background:#fafafa;' : '';
  return `            <tr style="border-bottom:1px solid var(--cat-border);${bg}">
              <td class="cell-model" data-label="모델명" style="padding:14px 16px;font-weight:700;color:var(--cat-black);">${p.model}</td>
              <td data-label="분류" style="padding:14px 16px;color:var(--cat-gray4);">${p.categoryLabel}</td>
              <td data-label="출력·사양" style="padding:14px 16px;color:var(--cat-gray4);">${p.spec}</td>
              <td data-label="주요 용도" style="padding:14px 16px;color:var(--cat-gray4);">${p.use}</td>
              <td data-label="상태" style="padding:14px 16px;text-align:center;">${statusBadge(p.status)}</td>
              <td class="cell-detail" style="padding:14px 16px;text-align:center;">
                <button class="detail-btn" data-id="${p.id}" style="background:var(--cat-yellow);color:var(--cat-black);border:none;padding:7px 14px;font-size:12px;font-weight:700;letter-spacing:0.3px;cursor:pointer;transition:background 0.2s;font-family:var(--font-body);">
                  상세보기 →
                </button>
              </td>
            </tr>`;
}).join('\n');

// 4) tbody 영역 교체 + 결과 카운트 초기값 16으로 변경
console.log('✏️  tbody 영역 업데이트 중...');

const newTbody = `<tbody id="productTableBody">
            <!-- BUILD-GENERATED START : do not edit by hand. Run: node build-product-table.js -->
${rowsHtml}
            <!-- BUILD-GENERATED END -->
          </tbody>`;

let newHtml = html.replace(
  /<tbody id="productTableBody">[\s\S]*?<\/tbody>/,
  newTbody
);

// 5) "총 0개 모델" → "총 16개 모델" (초기 카운트도 SEO 친화적으로)
newHtml = newHtml.replace(
  /<strong id="resultNum"([^>]*)>0<\/strong>/,
  `<strong id="resultNum"$1>${PRODUCT_DATA.length}</strong>`
);

// 6) 저장
fs.writeFileSync(HTML_PATH, newHtml, 'utf-8');

console.log(`✅ 완료! index.html 에 ${PRODUCT_DATA.length}개 행이 박혔습니다.`);
console.log('');
console.log('카테고리별 통계:');
const stats = {};
PRODUCT_DATA.forEach(p => {
  stats[p.categoryLabel] = (stats[p.categoryLabel] || 0) + 1;
});
Object.entries(stats).forEach(([k, v]) => {
  console.log(`  • ${k}: ${v}개`);
});
console.log('');
console.log('다음 단계: git add index.html && git commit -m "Update product table" && git push');
