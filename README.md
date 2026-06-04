# 지금 가는 중

중앙대학교 교내 공간의 실시간 혼잡도를 제보하고 확인하는 Next.js 프로토타입입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 로그인 테스트 계정

앱 시작 전 로그인 화면이 먼저 표시됩니다. 개발용 SQLite DB는 첫 API 호출 시 `data/jigum_ganun_jung.sqlite`에 생성되며, 아래 테스트 계정 10개가 자동 등록됩니다.

- 아이디: `test01` ~ `test10`
- 비밀번호: `cau1234!`

회원가입으로 새 계정을 만들 수도 있습니다. 비밀번호는 bcrypt hash로 저장되고, 로그인 세션은 HTTP-only 쿠키 JWT로 유지됩니다.

## 랭킹 공식

내 정보 화면에서 유저별 종합 랭킹 TOP 10을 확인할 수 있습니다.

```text
종합점수 = 포인트 + 제보수 * 5 + 신뢰도 * 2
```

동점이면 제보수, 포인트, 닉네임 순으로 정렬합니다.

## 주요 API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/reports`
- `GET /api/rankings`
- `GET /api/users`

## 검증

```bash
npm run lint
npm run build
```
