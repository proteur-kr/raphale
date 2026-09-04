/* timeline.js - 전체 가족 통합 타임라인: 구성원별/유형별 필터가 가능한
   시간순(최신순) 피드를 그립니다. */

(async function () {
  const { members, posts } = await loadData();
  const byId = membersById(members);
  const sorted = sortByDateDesc(posts);

  const state = { member: "all", type: "all" };

  const memberFilterEl = document.getElementById("member-filter");
  const typeFilterEl = document.getElementById("type-filter");
  const listEl = document.getElementById("timeline-list");

  // 구성원 필터 버튼 (전체 + 각 구성원)
  memberFilterEl.innerHTML = [
    `<button class="filter-pill" data-member="all" aria-pressed="true">전체</button>`,
    ...members.map(
      (m) => `<button class="filter-pill" data-member="${m.id}" aria-pressed="false">${m.name}</button>`
    ),
  ].join("");

  function applyFilters() {
    return sorted.filter((post) => {
      const memberMatch = state.member === "all" || post.memberId === state.member;
      const typeMatch = state.type === "all" || post.type === state.type;
      return memberMatch && typeMatch;
    });
  }

  function render() {
    const filtered = applyFilters();
    if (filtered.length === 0) {
      listEl.innerHTML = `<p class="empty-state">조건에 맞는 기록이 없어요.</p>`;
      return;
    }
    listEl.innerHTML = filtered
      .map(
        (post) =>
          `<div class="timeline-entry">${renderPostCard(post, byId[post.memberId], true)}</div>`
      )
      .join("");
  }

  function bindPillGroup(container, key) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-" + key + "]");
      if (!btn) return;
      state[key] = btn.dataset[key];
      container
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      render();
    });
  }

  bindPillGroup(memberFilterEl, "member");
  bindPillGroup(typeFilterEl, "type");

  render();
})();
