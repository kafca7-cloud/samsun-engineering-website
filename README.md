# SAMSUN 삼선엔지니어링 홈페이지 (www.samsuneng.co.kr)

정적 HTML 사이트. **빌드 단계 없음** — 저장소 루트의 파일이 그대로 배포됩니다 (Vercel, `main` 푸시 시 자동 배포).

## 구조

```
index.html                 메인 (유일하게 상단 드롭다운 네비·푸터를 자체 보유)
services/<slug>/index.html 사업분야 상세 9종 (sales, maintenance, diagnostics, fire-pump, marine, construction, rental, mro) + services/index.html 허브
products/                  CAT 라인업, in-house/ 자체 제작 제품, in-house/ss-svc-32cx/
about/                     performance, clients, tech, certifications
resources/                 notice/ (posts.json + 글별 html), library/ (files.json), faq.html
contact/, privacy/
img/                       이미지 (main/, marine/, fire-pump/, products/, certifications/ …)
files/library/             자료실 PDF
sitemap.xml, robots.txt, vercel.json (보안 헤더·CSP·301 리다이렉트)
_reference/components/     참고용 공통 블록 스니펫 (헤더·CTA·모바일 문의바·푸터·디자인 토큰). 배포 제외(.vercelignore)
_reference/tools/          build-product-table.js — 메인 제품 검색표 <tbody>를 PRODUCT_DATA로 미리 채우는 SEO 스크립트 (제품 모델 변경 시 `node _reference/tools/build-product-table.js`)
```

> 2026-10 이전에는 `src/` 템플릿을 `node build.js`로 루트에 생성하는 구조였으나, src가 루트보다 뒤처져 빌드 시 최신 내용이 덮어써지는 사고가 있어 **루트 단일 관리**로 전환했습니다. `src/`·`build.js`는 삭제됨 (git 이력에는 남아 있음).

## 작업 규칙

- **페이지 추가**: 가장 비슷한 기존 페이지를 복사해 수정. 서브페이지는 모두 자기완결형(CSS·푸터 인라인)이라 공통 블록을 바꿀 때는 전 페이지 일괄 치환 필요 → `grep -rl '<footer class="site-footer"' --include='*.html' .` 식으로 대상 확인 후 스크립트로 치환.
- **공지 추가**: ① `resources/notice/2026-05-19-website-renewal.html`을 복사해 `YYYY-MM-DD-slug.html`로 저장하고 title·description·canonical·og:url·본문·CTA 수정 ② `resources/notice/posts.json`에 항목 추가(날짜 내림차순) ③ `sitemap.xml`에 `<url>` 추가 ④ `<head>`의 BreadcrumbList JSON-LD 제목·URL 수정. 게시 날짜는 **실제 사건 날짜** 기준.
- **이미지**: 1,000~1,920px, webp 우선(사진 100~200KB 목표), 파일명은 영문 키워드(`cat-fire-pump-diesel-engine-overhaul.webp`), `alt`에 한글 키워드. 원본 대용량 JPG는 올리지 않음.
- **메타**: 모든 페이지에 title / description / canonical / og:* / twitter:card / BreadcrumbList. og:image는 기본 `/og-image.jpg`(1200×630), 해상 페이지는 전용 `/img/marine/og-marine.jpg`.
- **URL 변경 시**: 내부 링크 전체 치환 + `vercel.json` redirects에 301 추가 + sitemap 갱신.
- **회사 정보 변경 시**(주소·전화·대표): 푸터가 전 페이지에 인라인이라 `grep -rn '좌수영로 919' --include='*.html' .` 로 대상 확인 후 일괄 치환.

## 톤 가이드 (사용 금지 표현)

완전 · 완벽 · 100% · 무조건 · 최고 · 최저 · 보장 · 업계최고 · 동급최고 · 크게 향상 · 문제없습니다
→ "그대로 유지", "향상", "확보 가능", "적합", "대응 가능" 등으로. 영문 표기는 SAMSUN, HAEIN.

## 주의

- `vercel.json`의 CSP가 `script-src 'self'`라 **외부 스크립트(지도 위젯·분석 도구 등)는 CSP를 먼저 열어야** 동작합니다.
- 자격증 등 개인정보가 담긴 원본 PDF는 올리지 않음 — 블러·워터마크 처리한 썸네일만 사용.
- 주소 표기는 2026.07.01 행정통합에 따라 "전남광주통합특별시 여수시 좌수영로 919". 과거 등록기관 표기("전라남도지사 등록 2025.05.30")는 사실 기록이라 유지.
