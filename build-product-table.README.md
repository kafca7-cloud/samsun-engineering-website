# 제품 테이블 자동 동기화 도구

> SAMSUN 홈페이지의 PRODUCT SEARCH 섹션을 SEO 친화적으로 유지하는 스크립트입니다.

## 이게 뭔가요?

홈페이지의 "제품군별 주요 모델 검색" 표는 **자바스크립트로 동적 생성**됩니다.
브라우저 사용자에게는 잘 보이지만, **검색엔진(Google, Naver)은 자바스크립트를 거의 실행하지 않아서** 표가 비어있는 것처럼 인식합니다.

이 스크립트는 `PRODUCT_DATA` 배열의 내용을 읽어서, **HTML의 `<tbody>` 안에 16개 행을 미리 박아넣어** 검색엔진도 모든 모델 정보를 인식할 수 있게 합니다.

## 언제 실행하나요?

다음 작업을 하신 후에 실행하세요:

- ✅ 새 제품 모델 추가
- ✅ 기존 모델 사양 변경 (출력, 배기량 등)
- ✅ 상태 변경 (`'주문 생산'` → `'재고 보유'`)
- ✅ 카테고리 분류 수정

## 사용 방법

### 1단계: 사전 준비 (최초 1회만)

PC에 **Node.js** 가 설치되어 있어야 합니다. 아직 없으시면:

- https://nodejs.org 접속
- **LTS 버전** 다운로드 후 설치
- 설치 후 터미널(또는 명령 프롬프트)에서 `node --version` 입력해서 버전 표시되면 성공

### 2단계: 제품 데이터 수정

`index.html` 파일을 열고, `const PRODUCT_DATA = [` 부분을 찾으세요. 그 안의 객체를 수정/추가/삭제하면 됩니다.

예: 새 모델 추가

```javascript
{
  id: 'c9-land',                          // 고유 ID (영문 소문자, 하이픈)
  model: 'CAT C9',                        // 모델명 (표에 표시)
  category: 'land',                       // 'land' | 'marine' | 'parts'
  categoryLabel: '육상 발전기',            // 표에 표시되는 분류명
  spec: '200 ~ 300 ekW',                  // 출력/사양
  use: '중소형 산업시설',                  // 주요 용도
  status: '주문 생산',                    // '재고 보유' | '주문 생산' | '주문 공급'
  description: '...',                     // 상세 설명 (모달 표시용)
  specs: [                                // 상세 사양 (모달 표시용)
    ['엔진 모델', 'CAT C9'],
    ['배기량', '8.8 L'],
    // ...
  ],
  catalogUrl: 'https://www.cat.com/...',
  haeinUrl: 'https://catengine.haein.com/...'
},
```

### 3단계: 동기화 스크립트 실행

터미널을 열어서 이 폴더로 이동한 후:

```bash
node build-product-table.js
```

실행하면 이런 메시지가 나옵니다:

```
📖 index.html 읽는 중...
🔍 PRODUCT_DATA 배열 파싱 중...
✅ 16개 제품 데이터 발견
✏️  tbody 영역 업데이트 중...
✅ 완료! index.html 에 16개 행이 박혔습니다.
```

### 4단계: GitHub에 푸시

```bash
git add index.html
git commit -m "Update product table"
git push
```

또는 GitHub Desktop / VS Code 사용.

1~2분 후 Vercel이 자동 재배포하면 사이트에 반영됩니다.

## 작동 원리

1. 스크립트가 `index.html` 안의 `const PRODUCT_DATA = [...]` 배열을 읽음
2. 각 객체로부터 `<tr>` 행을 생성
3. `<tbody id="productTableBody">` 안의 내용을 새로 생성한 행으로 교체
4. 초기 카운트 "총 0개 모델" 도 "총 N개 모델" 로 함께 갱신

## 효과

| 대상 | 변경 전 | 변경 후 |
|---|---|---|
| 일반 방문자 (브라우저) | 16개 모델 표시 (JS 실행 후) | 16개 모델 즉시 표시 ⚡ |
| Google / Naver 봇 | "0개 모델, 검색 결과 없음" 인식 ❌ | 16개 모델 모두 인식 ✅ |
| SEO 키워드 | `CAT C32`, `C175`, `3516` 등 누락 | 모든 모델명 인덱싱됨 ✅ |

## 주의사항

- `<tbody>` 안의 `<!-- BUILD-GENERATED START -->` 와 `<!-- BUILD-GENERATED END -->` 사이 내용은 **수동 편집 금지**. 스크립트가 매번 덮어씁니다.
- 제품 데이터는 **반드시 `PRODUCT_DATA` 배열에서만** 수정하세요.
- 스크립트 실행 후 `index.html` 파일 크기가 늘어나는 건 정상입니다 (행 데이터가 추가되니까).

## 문제가 생기면

- `❌ PRODUCT_DATA 배열을 찾을 수 없습니다` → `const PRODUCT_DATA = [` 텍스트가 변형됐는지 확인
- `❌ PRODUCT_DATA 파싱 실패` → JavaScript 문법 오류 (쉼표 누락, 따옴표 짝 안 맞음 등). `index.html` 을 브라우저에서 열어 개발자도구(F12) 콘솔에서 빨간 에러 메시지 확인
- 그 외 오류 → Claude 에게 에러 메시지와 함께 도움 요청
