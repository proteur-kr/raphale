/* ==========================================================
   common.js
   여러 페이지에서 함께 쓰는 함수들.
   - loadData(): members.json / posts.json을 불러옵니다.
   - formatDate(): "2026-09-03" -> "2026년 9월 3일"
   - renderPostCard(): 포스트 하나를 카드 HTML로 만듭니다.

   주의: fetch()로 로컬 JSON을 읽기 때문에, 내 컴퓨터에서 파일을
   더블클릭해서 열면(file:// 로 열리면) 브라우저 보안 정책 때문에
   데이터가 안 보일 수 있어요. 아래 둘 중 하나로 확인하세요.
   1) 터미널에서 이 폴더로 이동 후: python3 -m http.server
      그다음 http://localhost:8000 접속
   2) 그냥 GitHub에 올려서 실제 도메인으로 확인
   ========================================================== */

const DATA_PATHS = {
  members: "/data/members.json",
  posts: "/data/posts.json",
};

async function loadData() {
  const [membersRes, postsRes] = await Promise.all([
    fetch(DATA_PATHS.members),
    fetch(DATA_PATHS.posts),
  ]);
  const members = await membersRes.json();
  const posts = await postsRes.json();
  return { members, posts };
}

function membersById(members) {
  const map = {};
  members.forEach((m) => (map[m.id] = m));
  return map;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

const TYPE_LABEL = { photo: "사진", diary: "일기" };

/**
 * 포스트 하나를 카드 HTML 문자열로 변환합니다.
 * @param {object} post
 * @param {object} member - 작성자 정보 (showAuthor가 true일 때 필요)
 * @param {boolean} showAuthor - 작성자 아바타/이름을 보여줄지 여부 (타임라인=true, 개인페이지=false)
 */
function renderPostCard(post, member, showAuthor) {
  const authorHtml =
    showAuthor && member
      ? `<img class="post-card__avatar" src="${member.avatar}" alt="${member.name}">
         <span class="post-card__author">${member.name}</span>`
      : "";

  const imagesHtml =
    post.images && post.images.length
      ? `<div class="post-card__images">
          ${post.images
            .map(
              (src) =>
                `<div class="img-tile"><img src="${src}" alt="${post.title}" loading="lazy" onerror="this.closest('.img-tile').classList.add('is-broken')"></div>`
            )
            .join("")}
        </div>`
      : "";

  return `
    <article class="post-card">
      <div class="post-card__meta">
        ${authorHtml}
        <span class="post-card__type">${TYPE_LABEL[post.type] || post.type}</span>
        <span class="post-card__date">${formatDate(post.date)}</span>
      </div>
      <h3>${post.title}</h3>
      <p class="post-card__body">${post.content}</p>
      ${imagesHtml}
    </article>
  `;
}
