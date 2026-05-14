# SAMSUN 사이트 빌드 시스템 사용법

## 🎯 이 시스템이 하는 일

서브 페이지(generator-inspection, faq 등)에 공통으로 들어가는 부분(헤더, CTA 문의 박스, 공통 CSS)을 **한 곳에서 관리**하고, 빌드 명령으로 자동 조립해 최종 HTML을 만들어줍니다.

**한 번 정의 → 모든 페이지에 자동 반영.**

---

## 📁 폴더 구조

```
samsun-engineering-website/
│
├── components/                       ⭐ 공통 부품 — 여기 수정 = 모든 페이지 영향
│   ├── design-tokens.css            (CSS 변수 + 공통 스타일)
│   ├── header-sub.html              (서브 페이지 상단 헤더 - "← 홈으로")
│   └── cta-section.html             (전화·이메일 문의 CTA)
│
├── src/                              ⭐ 페이지 소스 (콘텐츠만)
│   ├── generator-inspection.html
│   └── resources/
│       └── faq.html
│
├── build.js                          ⭐ 빌드 스크립트
├── BUILD_README.md                   (이 파일)
│
├── index.html                        (메인 - 빌드 시스템에 포함 X, 그대로 유지)
├── generator-inspection.html         ← 자동 생성 (수정 금지)
├── resources/faq.html                ← 자동 생성 (수정 금지)
├── img/                              (이미지)
└── sitemap.xml
```

---

## 🚀 매일 작업 흐름

### 1. 페이지 콘텐츠 수정할 때

```bash
# 1) src/ 폴더의 해당 파일 수정
#    예: src/resources/faq.html 의 FAQ 답변 수정

# 2) 빌드 실행
node build.js

# 3) GitHub에 푸시
git add .
git commit -m "FAQ 답변 수정"
git push
```

### 2. 헤더나 CTA 디자인 수정할 때 (공통 영역)

```bash
# 1) components/ 폴더의 해당 파일 수정
#    예: components/header-sub.html 의 버튼 텍스트 수정

# 2) 빌드 실행 (모든 페이지에 자동 반영됨!)
node build.js

# 3) GitHub에 푸시
git add .
git commit -m "헤더 디자인 통일"
git push
```

### 3. 새 페이지 추가할 때

```bash
# 1) src/ 폴더에 새 HTML 파일 작성 (아래 "새 페이지 만들기" 참고)
#    예: src/about/certifications.html

# 2) 빌드 실행 (자동으로 components가 삽입됨)
node build.js

# 3) sitemap.xml 에 새 페이지 URL 추가

# 4) GitHub에 푸시
```

---

## 📝 새 페이지 만들기 (템플릿)

```html
<!-- @meta {
  "cta_eyebrow": "ABOUT US",
  "cta_title": "더 자세한 정보가 필요하신가요?",
  "cta_sub": "본사 방문 또는 전화·이메일 문의 모두 가능합니다."
} -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목 - SAMSUN 삼선엔지니어링</title>
  <meta name="description" content="페이지 설명 (SEO용)">
  <link rel="canonical" href="https://samsuneng.co.kr/경로/페이지.html">

  <!-- 공통 디자인 토큰 (build.js가 자동 인라인) -->
  <style>
{{> design-tokens}}
  </style>
  
  <!-- 페이지 고유 CSS는 여기에 별도로 추가 -->
  <style>
    /* 이 페이지에만 필요한 스타일 */
  </style>
</head>
<body>

{{> header-sub}}

<section class="hero">
  <div class="hero-stripe"></div>
  <div class="hero-inner">
    <span class="hero-label">PAGE LABEL</span>
    <h1>페이지 제목<br><em>강조 부분</em></h1>
    <p class="lead">페이지 설명...</p>
  </div>
</section>

<!-- 페이지 본문 콘텐츠 -->
<section>
  ...
</section>

{{> cta-section}}

</body>
</html>
```

### 컴포넌트 마커 사용법

| 마커 | 설명 |
|---|---|
| `{{> design-tokens}}` | 공통 CSS 변수 + 기본 스타일 인라인 |
| `{{> header-sub}}` | "← 홈으로" 버튼 헤더 |
| `{{> cta-section}}` | 전화·이메일 문의 CTA |

### 페이지별 변수 (`@meta`)

페이지 상단의 `<!-- @meta { ... } -->` JSON으로 컴포넌트의 텍스트를 페이지마다 다르게 설정 가능:

| 변수 | 사용 위치 | 기본값 |
|---|---|---|
| `cta_eyebrow` | CTA 상단 작은 라벨 | "문의하기" |
| `cta_title` | CTA 큰 제목 | "궁금하신 점이 있으신가요?" |
| `cta_sub` | CTA 부제 | "35년 경력 SAMSUN 전문가가 직접 답변..." |

---

## ⚙️ 빌드 명령 옵션

```bash
node build.js              # 전체 빌드 (기본)
node build.js --check      # 변경 사항만 확인 (파일 안 씀)
node build.js --verbose    # 상세 로그
```

---

## ❓ FAQ

### Q. 빌드된 HTML을 직접 수정해도 되나요?
**A. 안 됩니다.** 다음 빌드 때 덮어쓰기 됩니다. 항상 `src/` 또는 `components/` 를 수정하세요.

### Q. 컴포넌트가 너무 단순해 보이는데, 더 복잡한 일은 못 하나요?
**A. 지금은 충분합니다.** 페이지가 50개 이상으로 늘어나면 Astro 같은 본격 도구로 갈아탈 수 있어요. 그 시점에 다시 검토하시면 됩니다.

### Q. CSS가 페이지마다 인라인으로 들어가서 중복 아닌가요?
**A. 인라인이 의도된 선택입니다.**
- 외부 CSS 파일 1개로 만들면 첫 페이지 로드가 더 느릴 수 있음
- 페이지마다 약간씩 다른 추가 스타일이 필요할 때 유연함
- 인라인 후에도 gzip 압축으로 실제 전송량은 매우 작음

만약 추후 페이지가 많아져 외부 CSS 분리가 더 좋아지면 그때 전환 가능합니다.

### Q. index.html(메인)은 왜 빌드 시스템에 없나요?
**A. 메인은 디자인이 워낙 독특하고 정교해서, 컴포넌트화의 이득보다 통째로 유지하는 게 안정적입니다.** 메인 디자인이 자주 바뀌지 않으니 문제 없습니다.

### Q. 새 컴포넌트를 만들고 싶어요.
**A. components/ 폴더에 .html 파일을 만들고 `{{> 이름}}`로 호출하면 됩니다.**

예시:
```bash
# 1) components/footer-simple.html 생성
echo '<div class="simple-footer">© 2025</div>' > components/footer-simple.html

# 2) src 페이지에서 호출
# {{> footer-simple}}

# 3) 빌드
node build.js
```

---

## 🎓 이렇게 좋아져요

**Before (예전 방식):**
```
헤더 디자인 변경 시
→ index.html 수정
→ generator-inspection.html 수정
→ faq.html 수정
→ (앞으로 추가될 페이지 N개 모두 수정)

페이지가 10개면 10번 같은 작업 = 동기화 지옥
```

**After (새 방식):**
```
헤더 디자인 변경 시
→ components/header-sub.html 1개 파일만 수정
→ node build.js
→ 자동으로 모든 페이지에 반영

페이지가 100개여도 작업은 1번
```

---

## 📞 문제가 생기면

빌드 에러:
- `❌ 컴포넌트를 찾을 수 없습니다`: components 폴더에 해당 파일이 있는지 확인
- `⚠️ 변수 미정의`: @meta JSON 또는 기본값 추가
- `⚠️ @meta JSON 파싱 실패`: JSON 문법 확인 (콤마, 따옴표)

빌드는 됐는데 페이지가 이상함:
- `src/` 파일에 컴포넌트 마커가 올바른지 확인
- 빌드 후 결과 HTML(`/generator-inspection.html` 등)을 브라우저에서 직접 열어보기

문제가 계속되면 `node build.js --verbose` 로 상세 로그 확인.
