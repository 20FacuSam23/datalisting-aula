const config = window.DATALISTING_AULA_CONFIG ?? {};
const apiBaseUrl = String(config.apiBaseUrl ?? "").replace(/\/$/, "");
const organizationSlug = config.organizationSlug ?? "";

const tones = ["warm", "blue", "green"];
const icons = ["⌨", "◎", "▣", "✉", "☁", "✓"];

const card = (course, index) => {
  const lessonCount = Number(course.lessons_count ?? 0);
  const lessonsLabel = lessonCount === 1 ? "1 clase" : `${lessonCount} clases`;

  return `<article class="course ${tones[index % tones.length]}" data-course-slug="${course.slug}">
    <span class="course-icon">${icons[index % icons.length]}</span>
    <span class="tag">DISPONIBLE</span>
    <h3>${escapeHtml(course.name)}</h3>
    <p>${escapeHtml(course.description || "Curso disponible en Datalisting Aula.")}</p>
    <div class="progress"><i style="width:0%"></i></div>
    <small>${lessonsLabel}</small>
  </article>`;
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

document.querySelector(".lesson")?.addEventListener("click", () =>
  alert("El siguiente paso es conectar esta acción con las clases reales del curso.")
);

document.querySelectorAll(".help aside button").forEach(x =>
  x.addEventListener("click", () =>
    alert("Esta opción se conectará con la ayuda guiada y el contacto con el docente.")
  )
);

loadCourses();
