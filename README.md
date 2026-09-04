# Proteur Family v01

기존 raphale 저장소를 대체할 새 가족 기록 사이트입니다.

## 1. 저장소에 적용하는 법

기존 `raphale` 저장소에서 아래 파일/폴더를 전부 지우고, 이 폴더(`proteur_family_site_v01`) 안의
내용물을 저장소 루트에 그대로 덮어쓴 다음 커밋 & 푸시하면 됩니다.

**지울 것 (기존 파일)**
- `index.html`, `proteur.html`, `hacking_terminal.html`
- `pages/page1.html` ~ `page4.html`
- `assets/css/index.css`, `page.css`, `proteur.css`, `terminal.css`
- `assets/js/index.js`, `page.js`, `proteur.js`, `terminal.js`

**유지되는 것**
- `CNAME`, `favicon.ico`, `assets/images/` 안의 로고·가족 그림·아바타 이미지는 그대로 재사용했습니다.

## 2. 로컬에서 미리보기

JS가 `data/*.json`을 `fetch()`로 읽기 때문에 파일을 그냥 더블클릭해서 열면
(`file://...`) 브라우저 보안 정책으로 데이터가 안 보일 수 있어요. 아래처럼 간단한
로컬 서버를 켜서 확인하세요.

```
cd proteur_family_site_v01
python3 -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000` 접속.

## 3. 기록(사진/일기) 추가하는 법

`data/posts.json`을 열어서 아래 형식으로 항목을 하나 추가하면 홈/타임라인/개인 페이지에
자동으로 반영됩니다.

```json
{
  "id": "고유한 id (아무 문자열이나 겹치지만 않으면 됨)",
  "memberId": "member1",        // members.json의 id와 일치해야 함
  "date": "2026-09-10",         // YYYY-MM-DD
  "type": "diary",              // "diary" 또는 "photo"
  "title": "제목",
  "content": "내용",
  "images": []                   // 사진 파일 경로 배열, 없으면 빈 배열
}
```

사진을 넣을 때는 이미지 파일을 `assets/images/posts/` 안에 넣고,
`images` 배열에 `/assets/images/posts/파일명.jpg` 형태로 경로를 적어주세요.
`data/posts.json`에는 형식을 보여주는 샘플 항목 6개가 들어있는데, 실제 기록을
추가하기 시작하면 지워도 됩니다.

## 4. 구성원 정보 수정하는 법

`data/members.json`에서 각 구성원의 `role`(역할), `intro`(소개), `likes`(좋아하는 것)를
직접 채워 넣으면 됩니다. 이름이나 사진(`avatar`)도 여기서 바꿀 수 있어요.

## 5. 공개 범위에 대해 참고

말씀하신 대로 비밀번호 입력 단계는 없앴습니다. 다만 가족사진·아이들 이름이 그대로
도메인에 공개되는 점이 마음에 걸려서, 검색엔진에는 안 걸리도록
`robots.txt`와 각 페이지에 `noindex` 태그를 넣어뒀어요 (구글 등에서 검색은 안 되지만,
링크를 아는 사람은 여전히 들어올 수 있는 상태입니다). 혹시 최소한의 비밀번호 정도는
다시 걸고 싶으시면 간단하게 (터미널 연출 없이) 추가해드릴 수 있어요.
