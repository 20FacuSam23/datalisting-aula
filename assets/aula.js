const config = window.DATALISTING_AULA_CONFIG ?? {};
const apiBaseUrl = String(config.apiBaseUrl ?? "").replace(/\/$/, "");
const organizationSlug = String(config.organizationSlug ?? "");
const tokenKey = `datalisting_aula_token_${organizationSlug}`;

let currentUser = null;

const tones = ["warm", "blue", "green"];
const icons = ["⌨", "◎", "▣", "✉", "☁", "✓"];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function roleLabel(role) {
  const labels = {
    administrador: "Administrador",
    docente: "Docente",
    alumno: "Alumno"
  };

  return labels[role] ?? "Usuario";
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

function token() {
  return sessionStorage.getItem(tokenKey);
}

function saveToken(value) {
  sessionStorage.setItem(tokenKey, value);
}

function clearToken() {
  sessionStorage.removeItem(tokenKey);
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (token()) {
    headers.set("Authorization", `Bearer ${token()}`);
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });
}

const card = (course, index) => {
  const lessonCount = Number(course.lessons_count ?? 0);
  const lessonsLabel = lessonCount === 1 ? "1 clase" : `${lessonCount} clases`;

  return `<article class="course ${tones[index % tones.length]}" data-course-slug="${escapeHtml(course.slug)}">
    <span class="course-icon">${icons[index % icons.length]}</span>
    <span class="tag">DISPONIBLE</span>
    <h3>${escapeHtml(course.name)}</h3>
    <p>${escapeHtml(course.description || "Curso disponible en Datalisting Aula.")}</p>
    <div class="progress"><i style="width:0%"></i></div>
    <small>${lessonsLabel}</small>
  </article>`;
};

function renderCourses(courses) {
  const list = Array.isArray(courses) ? courses : [];
  document.querySelector("#homeCourses").innerHTML = list.slice(0, 3).map(card).join("");
  document.querySelector("#allCourses").innerHTML = list.map(card).join("");

  const activeCourses = document.querySelector(".hero-meta div:first-child strong");
  if (activeCourses) activeCourses.textContent = list.length;
}

function renderCoursesError(message) {
  const html = `<article class="course warm">
    <span class="course-icon">!</span>
    <span class="tag">SIN CONEXIÓN</span>
    <h3>No pudimos cargar los cursos</h3>
    <p>${escapeHtml(message)}</p>
  </article>`;

  document.querySelector("#homeCourses").innerHTML = html;
  document.querySelector("#allCourses").innerHTML = html;
}

async function loadCourses() {
  if (!apiBaseUrl || !organizationSlug) {
    renderCoursesError("Falta configurar la dirección de la API o la organización.");
    return;
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/education/${encodeURIComponent(organizationSlug)}/courses`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      throw new Error(`El servidor respondió ${response.status}.`);
    }

    const data = await response.json();
    renderCourses(data.courses);
  } catch (error) {
    console.error("No se pudieron cargar los cursos:", error);
    renderCoursesError("Revisá la conexión con el backend de Datalisting.");
  }
}

function setAccountUI(user) {
  currentUser = user || null;

  document.querySelector("#profileAvatar").textContent = currentUser ? initials(currentUser.name) : "?";
  document.querySelector("#profileName").textContent = currentUser?.name || "Ingresar";
  document.querySelector("#profileRole").textContent = currentUser ? roleLabel(currentUser.role) : "Cuenta del aula";

  document.querySelector("#accountProfile").classList.toggle("hidden", !currentUser);
  document.querySelector("#accountCourses").classList.toggle("hidden", !currentUser);
  document.querySelector("#accountLogout").classList.toggle("hidden", !currentUser);
}

function openAuth() {
  document.querySelector("#authBackdrop").classList.remove("hidden");
  setTimeout(() => document.querySelector("#loginEmail")?.focus(), 0);
}

function closeAuth() {
  document.querySelector("#authBackdrop").classList.add("hidden");
  document.querySelector("#authError").classList.add("hidden");
  document.querySelector("#authError").textContent = "";
}

function toggleAccountMenu() {
  const menu = document.querySelector("#accountMenu");
  const button = document.querySelector("#profileButton");
  const opening = menu.classList.contains("hidden");

  menu.classList.toggle("hidden");
  button.setAttribute("aria-expanded", String(opening));
}

async function login(email, password) {
  const response = await fetch(
    `${apiBaseUrl}/education/${encodeURIComponent(organizationSlug)}/auth/login`,
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.errors?.email?.[0] || data?.message || "No se pudo iniciar sesión.";
    throw new Error(message);
  }

  saveToken(data.token);
  setAccountUI(data.user);
}

async function restoreSession() {
  if (!token()) {
    setAccountUI(null);
    return;
  }

  try {
    const response = await apiFetch(
      `/education/${encodeURIComponent(organizationSlug)}/auth/me`
    );

    if (!response.ok) {
      throw new Error("Sesión inválida");
    }

    const data = await response.json();
    setAccountUI(data.user);
  } catch {
    clearToken();
    setAccountUI(null);
  }
}

async function logout() {
  try {
    if (token()) {
      await apiFetch(
        `/education/${encodeURIComponent(organizationSlug)}/auth/logout`,
        { method: "POST" }
      );
    }
  } finally {
    clearToken();
    setAccountUI(null);
    document.querySelector("#accountMenu").classList.add("hidden");
  }
}

function show(view) {
  document.querySelectorAll(".view").forEach(x =>
    x.classList.toggle("hidden", x.dataset.section !== view)
  );

  document.querySelectorAll(".nav").forEach(x =>
    x.classList.toggle("active", x.dataset.view === view)
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach(x =>
  x.addEventListener("click", e => {
    e.preventDefault();
    show(x.dataset.view);
  })
);

document.querySelector("#profileButton")?.addEventListener("click", () => {
  if (!currentUser) {
    openAuth();
    return;
  }

  toggleAccountMenu();
});

document.querySelector("#authClose")?.addEventListener("click", closeAuth);

document.querySelector("#authBackdrop")?.addEventListener("click", e => {
  if (e.target.id === "authBackdrop") {
    closeAuth();
  }
});

document.querySelector("#loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const submit = e.currentTarget.querySelector('button[type="submit"]');
  const errorBox = document.querySelector("#authError");

  submit.disabled = true;
  errorBox.classList.add("hidden");

  try {
    await login(
      document.querySelector("#loginEmail").value.trim(),
      document.querySelector("#loginPassword").value
    );

    e.currentTarget.reset();
    closeAuth();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("hidden");
  } finally {
    submit.disabled = false;
  }
});

document.querySelector("#accountLogout")?.addEventListener("click", logout);

document.querySelector("#accountCourses")?.addEventListener("click", () => {
  document.querySelector("#accountMenu").classList.add("hidden");
  show("cursos");
});

document.querySelector("#accountProfile")?.addEventListener("click", () => {
  document.querySelector("#accountMenu").classList.add("hidden");

  if (currentUser) {
    alert(`${currentUser.name}\n${currentUser.email}\nRol: ${roleLabel(currentUser.role)}`);
  }
});

document.addEventListener("click", e => {
  if (!e.target.closest(".account")) {
    document.querySelector("#accountMenu")?.classList.add("hidden");
  }
});

document.querySelector(".lesson")?.addEventListener("click", () =>
  alert("El siguiente paso es conectar esta acción con las clases reales del curso.")
);

document.querySelectorAll(".help aside button").forEach(x =>
  x.addEventListener("click", () =>
    alert("Esta opción se conectará con la ayuda guiada y el contacto con el docente.")
  )
);

Promise.all([loadCourses(), restoreSession()]);
