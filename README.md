<img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/a39bd9ab-7ccb-47a9-b77c-1892dac73c77" />

>  **미루지마**는 Vue3와 Node.js 기반의 일정 관리 프로그램입니다. <br />
>  👉 [구경하기](https://mirujima.netlify.app)<br />
>  📝 [프로젝트 일지](https://www.notion.so/MIRUGIMA-311bf6f141ec80d184b1eda2dcd4559b?source=copy_link)<br />

<br /><br /><br />

# 📌 Table Of Contents
* [📖 Introduction](#-introduction)
* [⚙️ Tech Stack](#️-tech-stack)

<br />
<br />
<br />

# 📖 Introduction

### 1. 프로젝트 개요

* **미루지마**는 날짜 기반으로 Todo를 관리하는 일정 관리 웹 애플리케이션입니다.
* 사용자는 특정 날짜를 선택하여 할 일을 등록하고, 완료 여부를 체크할 수 있습니다.
* 월 단위 Todo 데이터를 집계하여 캘린더에 시각적으로 표시합니다.
* Vue3 기반 프론트엔드와 Node.js + MongoDB 기반 백엔드로 구성된 **풀스택 프로젝트**입니다.

<br />

### 2. 개발 환경

* Vue3 (Composition API)
* Vite
* Node.js (Express)
* MongoDB (Mongoose)
* JWT Authentication
* v-calendar

<br />

### 3. 프로젝트 내용

#### 3-1. Todo CRUD

* 선택한 날짜에 해당하는 Todo 목록 표시
* Todo 추가 / 수정 / 삭제
* 체크박스로 완료 여부 표시
* 수정 모드에서 Todo 내용 변경 가능

<br />

#### 3-2. 캘린더


* 날짜 선택 시 해당 날짜 Todo 조회
* 월 이동 시 해당 월 Todo summary API 호출
* Todo 완료 여부에 따라 캘린더에 dot 표시
  * 초록색 → 모두 완료
  * 빨간색 → 남은 할 일 존재

<br />

#### 3-3. 세션 관리

* JWT 기반 인증
* 로그인 상태 유지
* 세션 만료 시 자동 로그아웃 처리
* 세션 연장 기능 제공

<br />
<br />

# ⚙️ Tech Stack

### Frontend

Vue3
Vite
v-calendar
Composition API


### Backend


Node.js
Express
MongoDB
Mongoose
JWT


### Deployment


Frontend : Netlify
Backend : Render
Database : MongoDB Atlas


<br />
<br />
