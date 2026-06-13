# Prism Portfolio

lukebaffait.fr 레이아웃 구조 + aerukart.com 프리즘 스타일을 적용한 정적 포트폴리오입니다.

## 비개발자도 수정하는 방법

### 1) 텍스트/프로젝트 수정 (가장 쉬움)

- `content/site.json` — 이름, 소개, 연락처, 버튼 문구
- `content/projects.json` — 프로젝트 카드 (제목, 설명, 태그, 연도)

JSON만 고치면 사이트에 반영됩니다. 저장 후 GitHub Pages 또는 `npm run dev`로 확인하세요.

### 2) 색상/질감(프리즘) 수정

- Figma 파일에서 **Prism Theme** 변수 수정
- Cursor에게: **"Figma 토큰 변경사항 GitHub에 적용해줘"**
- 또는 `design/tokens.json` 직접 수정 후:

```bash
npm run apply:tokens
```

### 3) Figma ↔ GitHub 연동 흐름

1. Figma에서 색상·타이포·프레임 레이아웃 수정
2. 채팅: "Figma에서 바꾼 디자인 prism-portfolio에 적용해줘"
3. 에이전트가 Figma MCP로 변수/텍스트 읽기 → `design/tokens.json`, `content/*.json` 업데이트 → CSS 재생성

Figma 파일: `design/tokens.json`의 `meta.figmaFileKey` 참고

## 로컬 실행

```bash
npm run apply:tokens
npm run dev
```

브라우저: http://localhost:4173

## GitHub Pages

Settings → Pages → Source: `main` / root

## 페이지

- `/` Home
- `/works/` 프로젝트 가로 스크롤 (lukebaffait Work 페이지 구조)
- `/info/` 소개
- `/contact/` 연락

## 참고

- 레이아웃 참고: lukebaffait.fr
- 프리즘 비주얼 참고: aerukart.com
- 원본 사이트의 GSAP/Three.js 고급 애니메이션은 단계적으로 추가 예정
