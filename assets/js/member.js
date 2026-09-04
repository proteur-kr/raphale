/* member.js - 구성원 개별 페이지: 현재 페이지 파일명(member1.html 등)으로
   본인을 식별해서 프로필 카드와 본인 기록만 필터링된 피드를 그립니다. */

(async function () {
  const pageId = window.location.pathname.split("/").pop().replace(".html", "");
  const { members, posts } = await loadData();
  const member = members.find((m) => m.id === pageId);

  if (!member) {
    document.getElementById("profile-card").innerHTML =
      `<p class="empty-state">이 구성원 정보를 찾을 수 없어요. data/members.json을 확인해주세요.</p>`;
    return;
  }

  document.title = `${member.name} - Proteur Family`;

  // 프로필 카드
  document.getElementById("profile-card").innerHTML = `
    <span class="profile__avatar"><img src="${member.avatar}" alt="${member.name}"></span>
    <div>
      <h1 class="profile__name">${member.name}</h1>
      <p class="profile__role">${member.role}</p>
      <p class="profile__intro">${member.intro}</p>
    </div>
  `;
  document.getElementById("profile-likes").innerHTML = (member.likes || [])
    .map((like) => `<span class="like-tag">${like}</span>`)
    .join("");

  // 이 구성원의 기록만 필터
  const myPosts = sortByDateDesc(posts.filter((p) => p.memberId === pageId));
  const state = { type: "all" };
  const typeFilterEl = document.getElementById("type-filter");
  const feedEl = document.getElementById("feed");

  function render() {
    const filtered =
      state.type === "all" ? myPosts : myPosts.filter((p) => p.type === state.type);
    if (filtered.length === 0) {
      feedEl.innerHTML = `<p class="empty-state">아직 기록이 없어요.</p>`;
      return;
    }
    feedEl.innerHTML = filtered.map((post) => renderPostCard(post, member, false)).join("");
  }

  typeFilterEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-type]");
    if (!btn) return;
    state.type = btn.dataset.type;
    typeFilterEl
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    render();
  });

  render();
})();
