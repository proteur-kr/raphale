/* home.js - 가족 허브(홈) 페이지: members.json으로 구성원 카드를,
   posts.json 중 최신 4개로 "최근 기록" 미리보기를 그립니다. */

(async function () {
  const { members, posts } = await loadData();
  const byId = membersById(members);

  // 가족 구성원 카드
  const familyEl = document.getElementById("family");
  familyEl.innerHTML = members
    .map(
      (m) => `
      <a class="family__member" href="pages/${m.id}.html">
        <span class="family__avatar-wrap">
          <img src="${m.avatar}" alt="${m.name}">
        </span>
        <span class="family__name">${m.name}</span>
        <span class="family__role">${m.role}</span>
      </a>
    `
    )
    .join("");

  // 최근 기록 미리보기 (최신 4개)
  const recentEl = document.getElementById("recent-posts");
  const recent = sortByDateDesc(posts).slice(0, 4);

  if (recent.length === 0) {
    recentEl.innerHTML = `<p class="empty-state">아직 기록이 없어요. 첫 기록을 남겨보세요!</p>`;
    return;
  }

  recentEl.innerHTML = recent
    .map((post) => renderPostCard(post, byId[post.memberId], true))
    .join("");
})();
