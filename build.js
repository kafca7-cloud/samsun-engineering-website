#!/usr/bin/env node
/**
 * SAMSUN 정적 사이트 빌드 스크립트
 * ===================================
 * 
 * 동작:
 *   1. src/ 폴더의 HTML 파일들을 읽음
 *   2. {{> component-name}} 표시를 components/ 폴더의 내용으로 치환
 *   3. {{var_name|기본값}} 표시를 페이지별 변수로 치환
 *   4. 최종 HTML을 루트 폴더에 출력
 * 
 * 사용법:
 *   $ node build.js          (전체 빌드)
 *   $ node build.js --check  (변경 확인만, 파일 쓰지 않음)
 *   $ node build.js --verbose (상세 로그)
 * 
 * 새 페이지 추가:
 *   1. src/내경로/페이지.html 생성 (헤더 자리에 {{> header-sub}})
 *   2. 페이지 변수 설정 (필요 시): <!-- @meta { "cta_title": "..." } -->
 *   3. node build.js 실행 → 자동으로 components 삽입한 최종본 생성
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const COMPONENTS = path.join(ROOT, 'components');
const VERBOSE = process.argv.includes('--verbose');
const CHECK_ONLY = process.argv.includes('--check');

// ────────────────────────────────────────────
// 컴포넌트 로딩 (캐시)
// ────────────────────────────────────────────
const componentCache = {};
function loadComponent(name) {
  if (componentCache[name]) return componentCache[name];
  const filePath = path.join(COMPONENTS, `${name}.html`);
  const cssPath = path.join(COMPONENTS, `${name}.css`);

  let content;
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  } else if (fs.existsSync(cssPath)) {
    content = fs.readFileSync(cssPath, 'utf8');
  } else {
    throw new Error(`컴포넌트를 찾을 수 없습니다: ${name} (components/${name}.html 또는 components/${name}.css)`);
  }
  componentCache[name] = content;
  return content;
}

// ────────────────────────────────────────────
// 페이지 메타데이터 추출
// 페이지 상단에 <!-- @meta { "key": "value" } --> 형식으로 정의 가능
// ────────────────────────────────────────────
function extractMeta(content) {
  const match = content.match(/<!--\s*@meta\s+([\s\S]+?)\s*-->/);
  if (!match) return { content, meta: {} };

  try {
    const meta = JSON.parse(match[1]);
    const cleanContent = content.replace(match[0], '').trimStart();
    return { content: cleanContent, meta };
  } catch (err) {
    console.warn('⚠️  @meta JSON 파싱 실패, 무시함:', err.message);
    return { content, meta: {} };
  }
}

// ────────────────────────────────────────────
// 변수 치환: {{var_name|기본값}} → 값
// ────────────────────────────────────────────
function substituteVariables(content, meta) {
  return content.replace(/\{\{([a-zA-Z_][\w]*)(?:\|([^}]*?))?\}\}/g, (full, key, fallback) => {
    if (meta[key] !== undefined) return meta[key];
    if (fallback !== undefined) return fallback;
    console.warn(`⚠️  변수 미정의: {{${key}}}`);
    return full;
  });
}

// ────────────────────────────────────────────
// 컴포넌트 삽입: {{> name}} → 컴포넌트 내용
// ────────────────────────────────────────────
function insertComponents(content, meta) {
  return content.replace(/\{\{>\s*([a-zA-Z][\w-]*)\s*\}\}/g, (full, name) => {
    try {
      const componentContent = loadComponent(name);
      // 컴포넌트 안에도 변수가 있을 수 있음 (예: cta-section 안의 {{cta_title}})
      return substituteVariables(componentContent, meta);
    } catch (err) {
      console.error(`❌ ${err.message}`);
      return full;
    }
  });
}

// ────────────────────────────────────────────
// 페이지 1개 빌드
// ────────────────────────────────────────────
function buildPage(srcPath, outPath) {
  let content = fs.readFileSync(srcPath, 'utf8');
  const { content: cleanContent, meta } = extractMeta(content);

  // 컴포넌트 삽입 (그 안에서 변수도 치환)
  let result = insertComponents(cleanContent, meta);
  
  // 페이지 본문의 변수도 치환 (혹시 직접 쓰는 경우)
  result = substituteVariables(result, meta);

  // 상대 경로 (보고용)
  const relSrc = path.relative(ROOT, srcPath);
  const relOut = path.relative(ROOT, outPath);

  // 출력 폴더 생성
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // 변경 감지: 기존 파일과 다르면 쓰기
  let changed = true;
  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, 'utf8');
    changed = existing !== result;
  }

  if (CHECK_ONLY) {
    console.log(`  ${changed ? '🔄' : '✓ '} ${relSrc} → ${relOut} ${changed ? '(변경됨)' : '(동일)'}`);
    return { changed, size: result.length };
  }

  if (changed) {
    fs.writeFileSync(outPath, result, 'utf8');
    console.log(`  ✓ ${relSrc} → ${relOut} (${(result.length / 1024).toFixed(1)} KB)`);
  } else if (VERBOSE) {
    console.log(`  · ${relOut} (변경 없음, 스킵)`);
  }
  return { changed, size: result.length };
}

// ────────────────────────────────────────────
// src/ 폴더 전체 순회
// ────────────────────────────────────────────
function walkSrc(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSrc(fullPath, callback);
    } else if (entry.name.endsWith('.html') && !entry.name.startsWith('_')) {
      // _로 시작하는 파일(예: _template.html)은 빌드 제외
      callback(fullPath);
    } else if (entry.name.endsWith('.json')) {
      // JSON 파일은 그대로 복사 (공지/자료 목록 데이터)
      const relPath = path.relative(SRC, fullPath);
      const destPath = path.join(ROOT, relPath);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(fullPath, destPath);
      if (VERBOSE) console.log(`  📋 ${relPath} (JSON 복사)`);
    }
  }
}

// ────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────
function main() {
  console.log('🔨 SAMSUN 사이트 빌드 시작\n');

  if (!fs.existsSync(SRC)) {
    console.error(`❌ src/ 폴더가 없습니다: ${SRC}`);
    process.exit(1);
  }
  if (!fs.existsSync(COMPONENTS)) {
    console.error(`❌ components/ 폴더가 없습니다: ${COMPONENTS}`);
    process.exit(1);
  }

  let total = 0;
  let changed = 0;
  let totalSize = 0;

  walkSrc(SRC, (srcPath) => {
    const relativePath = path.relative(SRC, srcPath);
    const outPath = path.join(ROOT, relativePath);

    try {
      const result = buildPage(srcPath, outPath);
      total++;
      if (result.changed) changed++;
      totalSize += result.size;
    } catch (err) {
      console.error(`❌ 빌드 실패: ${relativePath}`);
      console.error(`   ${err.message}`);
      process.exit(1);
    }
  });

  console.log(`\n✨ 완료: ${total}개 페이지 처리 (${changed}개 변경, ${total - changed}개 동일)`);
  console.log(`   총 크기: ${(totalSize / 1024).toFixed(1)} KB`);

  if (CHECK_ONLY) {
    console.log('\n(--check 모드: 파일을 쓰지 않았습니다)');
  }
}

main();
