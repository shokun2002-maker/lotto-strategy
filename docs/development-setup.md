# 로컬 개발 환경 설정 및 Git 커밋 정보 안내 (Development Setup Guide)

본 문서는 LOTTO STRATEGY 프로젝트의 로컬 개발 환경 설정 및 Git 커밋 작성자 경고 해결 방법 가이드입니다.

---

## 1. Git Author (작성자 이름 및 이메일) 설정
터미널에서 커밋 실행 시 발생하는 경고(`Your name and email address were configured automatically...`)를 해결하려면 아래 명령을 실행하여 본인의 Git 작성자 정보를 설정합니다.

### 전체 시스템(Global) 설정 (권장)
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 본 프로젝트(Local) 전용 설정
```bash
git config --local user.name "Your Name"
git config --local user.email "you@example.com"
```

> **주의**: 실제 본인의 이름과 이메일 주소를 입력하십시오. (placeholder 예시값을 그대로 입력하지 마십시오)

---

## 2. 로컬 개발 환경 실행 방법

### 1) 패키지 설치
```bash
npm install
```

### 2) 환경 변수 파일 생성
`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 Supabase 프로젝트 키를 입력합니다:
```bash
cp .env.example .env.local
```

### 3) 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 주소로 접속합니다.

### 4) 프로덕션 빌드 검증
```bash
npm run build
```
