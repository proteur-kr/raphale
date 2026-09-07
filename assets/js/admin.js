/* admin.js - 홈페이지 안에서 사진/글을 올리고 지우고 수정하는 관리자 페이지.
   서버가 없는 정적 사이트라, "저장"을 누르면 브라우저가 GitHub API를
   직접 호출해서 커밋까지 해줍니다. 그래서 GitHub 개인 액세스 토큰이
   필요해요 (최초 1회만 입력하면 이 브라우저에 저장돼요). */

const REPO_OWNER = "proteur-kr";
const REPO_NAME = "raphale";
const REPO_BRANCH = "main";
const API_BASE = "https://api.github.com";
const TOKEN_KEY = "proteur_admin_token";

// ---------- 문자열 <-> base64 (한글 등 멀티바이트 문자 안전하게 처리) ----------
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- GitHub API 헬퍼 ----------
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function ghRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/vnd.github+json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.message) || `GitHub API 오류 (${res.status})`);
  }
  return data;
}

// 파일 하나 가져오기 (JSON 파일용: content를 문자열로 디코딩해서 반환)
async function getJsonFile(path) {
  const data = await ghRequest(`contents/${path}?ref=${REPO_BRANCH}`);
  return { json: JSON.parse(base64ToUtf8(data.content)), sha: data.sha };
}

// 파일 생성/수정
async function putFile(path, base64Content, sha, message) {
  return ghRequest(`contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      sha: sha || undefined,
      branch: REPO_BRANCH,
    }),
  });
}

// 파일 삭제 (없으면 조용히 무시)
async function deleteFile(path, message) {
  try {
    const meta = await ghRequest(`contents/${path}?ref=${REPO_BRANCH}`);
    await ghRequest(`contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify({ message, sha: meta.sha, branch: REPO_BRANCH }),
    });
  } catch (e) {
    console.warn("이미지 삭제 건너뜀:", path, e.message);
  }
}

function stripLeadingSlash(p) {
  return p.startsWith("/") ? p.slice(1) : p;
}

// ---------- 화면 상태 ----------
const setupScreen = document.getElementById("setup-screen");
const adminScreen = document.getElementById("admin-screen");
const setupError = document.getElementById("setup-error");

let members = [];
let posts = [];

// 기록 수정 모드일 때 채워지는 상태
let editingPostId = null;
let editingKeptImages = []; // 기존 사진 중 유지할 것들 (경로 배열)

async function checkTokenAndLoad() {
  if (!getToken()) {
    setupScreen.hidden = false;
    adminScreen.hidden = true;
    return;
  }
  try {
    const [membersRes, postsRes] = await Promise.all([
      getJsonFile("data/members.json"),
      getJsonFile("data/posts.json"),
    ]);
    members = membersRes.json;
    posts = postsRes.json;

    const memberOptions = members.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    document.getElementById("f-member").innerHTML = memberOptions;
    document.getElementById("m-member").innerHTML = memberOptions;
    document.getElementById("f-date").value = new Date().toISOString().slice(0, 10);

    fillMemberProfileForm();
    renderPostsList();
    setupScreen.hidden = true;
    adminScreen.hidden = false;
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY);
    setupError.textContent = "토큰이 유효하지 않거나 만료됐어요. 다시 발급해서 입력해주세요. (" + e.message + ")";
    setupScreen.hidden = false;
    adminScreen.hidden = true;
  }
}

document.getElementById("save-token-btn").addEventListener("click", () => {
  const token = document.getElementById("token-input").value.trim();
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  setupError.textContent = "";
  checkTokenAndLoad();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  checkTokenAndLoad();
});

// ---------- 구성원 소개 수정 ----------
function fillMemberProfileForm() {
  const id = document.getElementById("m-member").value;
  const m = members.find((mm) => mm.id === id);
  if (!m) return;
  document.getElementById("m-name").value = m.name || "";
  document.getElementById("m-role").value = m.role || "";
  document.getElementById("m-intro").value = m.intro || "";
  document.getElementById("m-likes").value = (m.likes || []).join(", ");
}

document.getElementById("m-member").addEventListener("change", fillMemberProfileForm);

document.getElementById("member-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("member-submit-btn");
  const statusEl = document.getElementById("member-status");
  const id = document.getElementById("m-member").value;

  const name = document.getElementById("m-name").value.trim();
  const role = document.getElementById("m-role").value.trim();
  const intro = document.getElementById("m-intro").value.trim();
  const likes = document.getElementById("m-likes").value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name) {
    statusEl.textContent = "이름은 비워둘 수 없어요.";
    return;
  }

  btn.disabled = true;
  statusEl.textContent = "저장 중...";
  try {
    const fresh = await getJsonFile("data/members.json");
    const updated = fresh.json.map((m) =>
      m.id === id ? { ...m, name, role, intro, likes } : m
    );

    await putFile(
      "data/members.json",
      utf8ToBase64(JSON.stringify(updated, null, 2)),
      fresh.sha,
      `구성원 프로필 수정: ${name}`
    );

    members = updated;
    // 기록 폼의 구성원 이름 표시도 갱신
    const memberOptions = members.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    const prevF = document.getElementById("f-member").value;
    const prevM = document.getElementById("m-member").value;
    document.getElementById("f-member").innerHTML = memberOptions;
    document.getElementById("m-member").innerHTML = memberOptions;
    document.getElementById("f-member").value = prevF;
    document.getElementById("m-member").value = prevM;

    renderPostsList();
    statusEl.textContent = "저장했어요! 1~2분 뒤 사이트에 반영돼요.";
  } catch (err) {
    statusEl.textContent = "저장 실패: " + err.message;
  } finally {
    btn.disabled = false;
  }
});

// ---------- 기존 기록 목록 ----------
function renderPostsList() {
  const byId = {};
  members.forEach((m) => (byId[m.id] = m));
  const listEl = document.getElementById("posts-list");

  if (posts.length === 0) {
    listEl.innerHTML = `<p class="empty-state">아직 기록이 없어요.</p>`;
    return;
  }

  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  listEl.innerHTML = sorted
    .map((p) => {
      const m = byId[p.memberId];
      return `
        <div class="admin-post-row" data-id="${p.id}">
          <div>
            <strong>${m ? m.name : p.memberId}</strong>
            <span class="admin-post-date">${p.date} · ${p.type === "photo" ? "사진" : "일기"}</span>
            <div>${p.title}</div>
          </div>
          <div class="admin-post-actions">
            <button class="edit-btn" data-id="${p.id}">수정</button>
            <button class="delete-btn" data-id="${p.id}">삭제</button>
          </div>
        </div>
      `;
    })
    .join("");

  listEl.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id));
  });
  listEl.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleEditStart(btn.dataset.id));
  });
}

async function handleDelete(id) {
  const target = posts.find((p) => p.id === id);
  if (!target) return;
  if (!confirm(`"${target.title}" 기록을 삭제할까요? 되돌릴 수 없어요.`)) return;

  const statusEl = document.getElementById("form-status");
  statusEl.textContent = "삭제 중...";

  try {
    const fresh = await getJsonFile("data/posts.json");
    const updated = fresh.json.filter((p) => p.id !== id);

    await putFile(
      "data/posts.json",
      utf8ToBase64(JSON.stringify(updated, null, 2)),
      fresh.sha,
      `기록 삭제: ${target.title}`
    );

    for (const img of target.images || []) {
      await deleteFile(stripLeadingSlash(img), `이미지 삭제: ${img}`);
    }

    posts = updated;
    if (editingPostId === id) exitEditMode();
    renderPostsList();
    statusEl.textContent = "삭제했어요.";
  } catch (e) {
    statusEl.textContent = "삭제 실패: " + e.message;
  }
}

// ---------- 기록 수정 모드 ----------
function renderExistingImages() {
  const field = document.getElementById("existing-images-field");
  const wrap = document.getElementById("existing-images");

  if (!editingPostId || editingKeptImages.length === 0) {
    field.hidden = true;
    wrap.innerHTML = "";
    return;
  }

  field.hidden = false;
  wrap.innerHTML = editingKeptImages
    .map(
      (src, i) => `
      <div class="existing-image-tile" data-index="${i}">
        <img src="${src}" alt="">
        <button type="button" data-index="${i}" title="이 사진 빼기">×</button>
      </div>
    `
    )
    .join("");

  wrap.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      editingKeptImages.splice(Number(btn.dataset.index), 1);
      renderExistingImages();
    });
  });
}

function handleEditStart(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  editingPostId = id;
  editingKeptImages = [...(post.images || [])];

  document.getElementById("f-member").value = post.memberId;
  document.getElementById("f-type").value = post.type;
  document.getElementById("f-date").value = post.date;
  document.getElementById("f-title").value = post.title;
  document.getElementById("f-content").value = post.content;
  imageInput.value = "";
  document.getElementById("image-preview").innerHTML = "";
  renderExistingImages();

  document.getElementById("post-form-title").textContent = "기록 수정";
  document.getElementById("submit-btn").textContent = "수정 저장";
  document.getElementById("cancel-edit-btn").hidden = false;
  document.getElementById("form-status").textContent = "";

  document.getElementById("post-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitEditMode() {
  editingPostId = null;
  editingKeptImages = [];
  document.getElementById("post-form").reset();
  document.getElementById("f-date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("image-preview").innerHTML = "";
  renderExistingImages();

  document.getElementById("post-form-title").textContent = "새 기록 추가";
  document.getElementById("submit-btn").textContent = "저장";
  document.getElementById("cancel-edit-btn").hidden = true;
}

document.getElementById("cancel-edit-btn").addEventListener("click", exitEditMode);

// ---------- 새 기록 추가 / 수정 저장 ----------
const imageInput = document.getElementById("f-images");
imageInput.addEventListener("change", () => {
  const preview = document.getElementById("image-preview");
  preview.innerHTML = "";
  [...imageInput.files].forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = reader.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("form-status");

  const memberId = document.getElementById("f-member").value;
  const type = document.getElementById("f-type").value;
  const date = document.getElementById("f-date").value;
  const title = document.getElementById("f-title").value.trim();
  const content = document.getElementById("f-content").value.trim();
  const files = [...imageInput.files];

  if (!date || !title || !content) {
    statusEl.textContent = "날짜, 제목, 내용은 꼭 입력해주세요.";
    return;
  }

  submitBtn.disabled = true;
  try {
    // 1) 새로 고른 사진이 있으면 먼저 하나씩 업로드
    const newImagePaths = [];
    for (let i = 0; i < files.length; i++) {
      statusEl.textContent = `사진 업로드 중... (${i + 1}/${files.length})`;
      const file = files[i];
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filename = `${Date.now()}-${i}.${ext}`;
      const path = `assets/images/posts/${filename}`;
      const base64 = await fileToBase64(file);
      await putFile(path, base64, null, `사진 추가: ${filename}`);
      newImagePaths.push(`/${path}`);
    }

    statusEl.textContent = "기록 저장 중...";
    const fresh = await getJsonFile("data/posts.json");

    if (editingPostId) {
      // ---- 기존 기록 수정 ----
      const finalImages = [...editingKeptImages, ...newImagePaths];
      const original = fresh.json.find((p) => p.id === editingPostId);
      const updated = fresh.json.map((p) =>
        p.id === editingPostId
          ? { ...p, memberId, type, date, title, content, images: finalImages }
          : p
      );

      await putFile(
        "data/posts.json",
        utf8ToBase64(JSON.stringify(updated, null, 2)),
        fresh.sha,
        `기록 수정: ${title}`
      );

      // 사용자가 뺀 기존 사진 파일은 정리 (실패해도 무시)
      const removed = (original.images || []).filter((img) => !finalImages.includes(img));
      for (const img of removed) {
        await deleteFile(stripLeadingSlash(img), `이미지 삭제: ${img}`);
      }

      posts = updated;
      renderPostsList();
      statusEl.textContent = "수정했어요! 1~2분 뒤 사이트에 반영돼요.";
      exitEditMode();
    } else {
      // ---- 새 기록 추가 ----
      const newPost = {
        id: `post-${Date.now()}`,
        memberId,
        date,
        type,
        title,
        content,
        images: newImagePaths,
      };
      const updated = [newPost, ...fresh.json];

      await putFile(
        "data/posts.json",
        utf8ToBase64(JSON.stringify(updated, null, 2)),
        fresh.sha,
        `새 기록: ${title}`
      );

      posts = updated;
      renderPostsList();
      statusEl.textContent = "저장했어요! 1~2분 뒤 사이트에 반영돼요.";
      document.getElementById("post-form").reset();
      document.getElementById("f-date").value = new Date().toISOString().slice(0, 10);
      document.getElementById("image-preview").innerHTML = "";
    }
  } catch (e) {
    statusEl.textContent = "저장 실패: " + e.message;
  } finally {
    submitBtn.disabled = false;
  }
});

checkTokenAndLoad();
