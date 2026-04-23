# AGENTS.md

이 저장소에서 작업하는 AI 에이전트가 반드시 지켜야 할 규칙.

## 훅(hooks)은 필수 작업이다

`.claude/settings.local.json`과 `.claude/hooks/` 디렉토리에 등록된 훅은 이 프로젝트의 작업 흐름을 구성하는 일부다. 장식이 아니라 **반드시 인지하고 활용해야 할 전제**다.

### 현재 등록된 훅

- **Stop 훅 — `ensure-dev-server.sh`**
  - 매 턴 종료 시 `localhost:3000`에 Next.js dev 서버가 떠 있도록 보장한다.
  - :3001–3010에 남은 stray node/next 프로세스를 정리하고, :3000이 비어 있으면 `npm run dev`를 detached로 띄운다.
  - 로그: `/tmp/gdrb-nanobanana-dev.log`

### 에이전트가 지켜야 할 행동

1. **작업 시작 전에** `.claude/hooks/`와 `.claude/settings.local.json`을 먼저 확인한다. 훅의 존재와 역할을 모른 채로 움직이지 않는다.
2. **UI/프론트엔드 변경 후에는 반드시** `http://localhost:3000`에서 실제 렌더링을 검증한다. 훅이 서버를 올려주므로 따로 `npm run dev`를 띄울 필요 없다.
   - 서버 상태: `lsof -ti tcp:3000`
   - HTML/폰트/링크 검증: `curl -s http://localhost:3000 | grep ...`
3. 타입 체크·빌드 통과만으로 "완료"라고 보고하지 않는다. 기능 정확성은 브라우저/HTTP 응답으로 확인해야 한다.
4. 훅이 자동으로 처리하는 일(dev 서버 기동 등)을 중복 실행하지 않는다. 이미 :3000에 Next.js가 떠 있다면 그대로 활용한다.

## 디자인 변경은 스킬 경유

시각적 변경(색·타이포·간격·섀도우·컴포넌트 스타일·`globals.css`·`tailwind.config.ts`·`className` 수정 등)은 **반드시 `design-system` 스킬을 통해서** 진행한다.

- 스킬 위치: `.claude/skills/design-system/SKILL.md`
- 스킬에는 이 저장소가 실제로 사용 중인 토큰·유틸리티·컴포넌트 패턴, 그리고 `DESIGN.md`에서 의도적으로 벗어난 부분(예: 한글 UI를 위해 Pretendard 고딕으로 통일)이 기록되어 있다.
- `DESIGN.md`(루트)는 **참고용 철학 문서**로만 읽는다. 실제 수정의 근거는 스킬이다. 충돌 시 스킬이 우선한다.
- 새로운 디자인 결정을 내린 경우, 스킬의 "Deviations" 또는 "Do/Don't" 섹션을 업데이트해 후속 에이전트가 같은 판단을 유지할 수 있게 한다.

## 사건 기록

- 2026-04-23: 폰트 문제 수정 작업에서 Stop 훅이 dev 서버를 자동으로 띄워주는 것을 놓치고 브라우저 검증 없이 완료 보고. 사용자가 AGENTS.md 작성을 지시. 재발 방지 목적.
- 2026-04-23: DESIGN.md의 "Serif for headlines" 규칙과 "전체 고딕 통일" 요청이 충돌. 프로젝트 실제 상태를 반영한 `design-system` 스킬을 분리하고, DESIGN.md는 참고용으로 격하. 이후 디자인 수정은 스킬 경유를 원칙으로 함.
