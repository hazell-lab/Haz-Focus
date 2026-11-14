// storage keys
const TASKS_KEY = "HazFocus-tasks";
const FILTERS_KEY = "HazFocus-filters";
const THEME_KEY = "HazFocus-theme";
const NAME_KEY = "HazFocus-name";
const FOCUS_KEY = "HazFocus-focus";
const FOCUS_SETTINGS_KEY = "HazFocus-focus-settings";
const FOCUS_LOG_KEY = "HazFocus-focus-log";
const FOCUS_HISTORY_KEY = "HazFocus-focus-history";
const DEFAULT_NAME = "Hazim Aqil";

// labels and settings
const statuses = ["todo", "inprogress", "completed"];
const categories = ["personal", "study", "work", "coding", "fitness"];
const statusLabels = {
  todo: "To do",
  inprogress: "In progress",
  completed: "Completed"
};
const toastMessages = {
  todo: "Task moved to todo",
  inprogress: "Task moved to in progress",
  completed: "Task completed"
};
const priorityOrder = { high: 1, medium: 2, low: 3 };
const pageTitles = {
  dashboard: "Dashboard",
  all: "All tasks",
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
  focus: "Focus",
  settings: "Settings"
};

// app data
let tasks = [];
let currentView = "dashboard";
let filters = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  due: "all",
  sort: "newest"
};
let editingId = null;
let draggedId = null;
let confirmAction = null;

// sidebar elements
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menu-btn");
const navItems = document.querySelectorAll(".nav-item");
const categoryButtons = document.querySelectorAll(".category-item");
const navCountAll = document.getElementById("nav-count-all");
const navCountToday = document.getElementById("nav-count-today");
const navCountUpcoming = document.getElementById("nav-count-upcoming");
const navCountCompleted = document.getElementById("nav-count-completed");
const categoryCounts = document.querySelectorAll("[data-category-count]");

// header elements
const pageTitle = document.getElementById("page-title");
const greetingText = document.getElementById("greeting-text");
const currentDateText = document.getElementById("current-date");
const searchInput = document.getElementById("search-input");
const themeBtn = document.getElementById("theme-btn");
const themeIcon = document.getElementById("theme-icon");
const addTaskBtn = document.getElementById("add-task-btn");
const mobileAddBtn = document.getElementById("mobile-add-btn");
const header = document.querySelector(".header");
const content = document.getElementById("content");

// dashboard elements
const dashboardSection = document.getElementById("dashboard-section");
const statToday = document.getElementById("stat-today");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statOverdue = document.getElementById("stat-overdue");
const progressText = document.getElementById("progress-text");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const productivityMessage = document.getElementById("productivity-message");
const statOverdueWrap = document.getElementById("stat-overdue-wrap");
const agenda = document.getElementById("agenda");
const areaList = document.getElementById("area-list");
const areasBlock = document.getElementById("areas-block");
const weekChart = document.getElementById("week-chart");
const weekSummary = document.getElementById("week-summary");
const weekTableBody = document.querySelector("#week-table tbody");
const areaSummary = document.getElementById("area-summary");

// toolbar elements
const toolbar = document.getElementById("toolbar");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const filterCategory = document.getElementById("filter-category");
const filterDue = document.getElementById("filter-due");
const sortSelect = document.getElementById("sort-select");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const filterToggle = document.getElementById("filter-toggle");
const filterBadge = document.getElementById("filter-badge");
const toolbarTitle = document.getElementById("toolbar-title");
const filterSelects = [filterStatus, filterPriority, filterCategory, filterDue];

// task area elements
const boardView = document.getElementById("board-view");
const taskListView = document.getElementById("task-list-view");
const taskGrid = document.getElementById("task-grid");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");
const emptyAddBtn = document.getElementById("empty-add-btn");
const dropLists = document.querySelectorAll(".task-list");

// settings elements
const settingsView = document.getElementById("settings-view");
const themeSwitch = document.getElementById("theme-switch");
const resetSamplesBtn = document.getElementById("reset-samples-btn");
const deleteAllBtn = document.getElementById("delete-all-btn");
const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const heroName = document.getElementById("hero-name");
const profileName = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");

// task modal elements
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("task-modal-title");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const categoryInput = document.getElementById("task-category");
const priorityInput = document.getElementById("task-priority");
const dueInput = document.getElementById("task-due");
const statusInput = document.getElementById("task-status");
const titleError = document.getElementById("title-error");
const dueError = document.getElementById("due-error");
const submitBtn = document.getElementById("submit-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");

// confirm modal elements
const confirmModal = document.getElementById("confirm-modal");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmOkBtn = document.getElementById("confirm-ok-btn");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");

// toast container
const toastContainer = document.getElementById("toast-container");


// date helpers

// turn a date object into yyyy-mm-dd
function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// get today's date as yyyy-mm-dd
function getTodayString() {
  return formatDateInput(new Date());
}

// get a date a few days from today
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

// show a friendly date like 15 oct 2026
function formatDate(dateString) {
  if (!dateString) {
    return "No due date";
  }
  const parts = dateString.split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// check if a task is overdue
function isOverdue(task) {
  return Boolean(task.dueDate) && task.dueDate < getTodayString() && task.status !== "completed";
}

// check if a task is due today
function isDueToday(task) {
  return task.dueDate === getTodayString();
}

// check if a task is due in the future
function isUpcoming(task) {
  return Boolean(task.dueDate) && task.dueDate > getTodayString() && task.status !== "completed";
}

// get a greeting for the time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

// get the saved name, the default name is used until the user changes it
function getUserName() {
  const saved = readStorage(NAME_KEY);
  return saved === null ? DEFAULT_NAME : saved;
}

// get initials like ha from hazim aqil
function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join("");
}

// show the name in the greeting and the sidebar
function showUserName() {
  const name = getUserName().trim();
  const firstName = name.split(/\s+/)[0];

  heroName.textContent = firstName ? ", " + firstName + "." : ".";
  profileName.textContent = name;
  profileAvatar.textContent = getInitials(name);
  profileAvatar.parentElement.hidden = name === "";
  nameInput.value = name;
}

// save the name from settings
function handleNameSubmit(event) {
  event.preventDefault();
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  writeStorage(NAME_KEY, name);
  showUserName();
  showToast(name ? "Name saved" : "Name hidden");
}

// show greeting and date in the header
function showGreeting() {
  greetingText.textContent = getGreeting();
  currentDateText.textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}


// small helpers

// make text safe before adding it to html
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// make the first letter big
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// icons for each toast type
const toastIcons = {
  success: "i-check",
  delete: "i-trash",
  error: "i-alert"
};

// build an svg icon from the sprite
function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
}

// check if the user asked for less motion
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// show a toast message
function showToast(message, type) {
  const toastType = toastIcons[type] ? type : "success";
  const toast = document.createElement("div");
  toast.className = "toast toast-" + toastType;
  toast.innerHTML = `${icon(toastIcons[toastType])}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  // hide the toast after a short time
  setTimeout(function () {
    toast.classList.add("hide");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2500);
}


// localstorage

// get sample tasks for first visit
function getSampleTasks() {
  const now = Date.now();
  const today = getTodayString();

  return [
    {
      id: now + 1,
      title: "Finish JavaScript practice",
      description: "Complete the weather dashboard exercises and push them to github.",
      category: "coding",
      priority: "high",
      dueDate: addDays(2),
      status: "inprogress",
      createdAt: today
    },
    {
      id: now + 2,
      title: "Revise database notes",
      description: "Go through sql joins and normalization.",
      category: "study",
      priority: "medium",
      dueDate: addDays(5),
      status: "todo",
      createdAt: today
    },
    {
      id: now + 3,
      title: "Workout",
      description: "30 minute run and stretching.",
      category: "fitness",
      priority: "low",
      dueDate: today,
      status: "completed",
      createdAt: today,
      completedAt: today
    },
    {
      id: now + 4,
      title: "Update portfolio",
      description: "Add the new projects and refresh the about section.",
      category: "coding",
      priority: "high",
      dueDate: today,
      status: "todo",
      createdAt: today
    },
    {
      id: now + 5,
      title: "Prepare internship resume",
      description: "Update skills and add project links.",
      category: "work",
      priority: "high",
      dueDate: addDays(-1),
      status: "todo",
      createdAt: today
    }
  ];
}

// read from localstorage safely (it can be blocked in private mode)
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

// write to localstorage safely
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    showToast("Could not save. Storage is full or blocked.", "error");
  }
}

// save tasks
function saveTasks() {
  writeStorage(TASKS_KEY, JSON.stringify(tasks));
}

// get saved tasks
function loadTasks() {
  const saved = readStorage(TASKS_KEY);

  // first visit, use sample tasks
  if (saved === null) {
    tasks = getSampleTasks();
    saveTasks();
    return;
  }

  try {
    tasks = JSON.parse(saved);
  } catch (error) {
    tasks = [];
  }

  if (!Array.isArray(tasks)) {
    tasks = [];
  }

  // fix tasks with missing or broken fields so the app does not crash
  tasks = tasks
    .filter(function (task) {
      return task && typeof task === "object";
    })
    .map(normalizeTask);
}

// make sure a task has every field with a valid value
function normalizeTask(task, index) {
  return {
    id: Number(task.id) || Date.now() + index,
    title: String(task.title || "Untitled task"),
    description: String(task.description || ""),
    category: categories.includes(task.category) ? task.category : "personal",
    priority: priorityOrder[task.priority] ? task.priority : "medium",
    dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
    status: statuses.includes(task.status) ? task.status : "todo",
    createdAt: task.createdAt || getTodayString(),
    // only kept when known, older tasks have no completion date
    completedAt: task.status === "completed" && typeof task.completedAt === "string" ? task.completedAt : ""
  };
}

// save selected filters
function saveFilters() {
  const data = {
    status: filters.status,
    priority: filters.priority,
    category: filters.category,
    due: filters.due,
    sort: filters.sort
  };
  writeStorage(FILTERS_KEY, JSON.stringify(data));
}

// get saved filters
function loadFilters() {
  const saved = readStorage(FILTERS_KEY);
  if (!saved) {
    return;
  }

  try {
    const data = JSON.parse(saved);
    filters = Object.assign({}, filters, data, { search: "" });
  } catch (error) {
    // ignore broken data
  }
}

// show saved filters in the select boxes
function syncFilterControls() {
  filterStatus.value = filters.status;
  filterPriority.value = filters.priority;
  filterCategory.value = filters.category;
  filterDue.value = filters.due;
  sortSelect.value = filters.sort;
  searchInput.value = filters.search;
}


// theme

// apply light or dark theme
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "dark") {
    themeIcon.setAttribute("href", "#i-sun");
    themeBtn.setAttribute("aria-label", "switch to light theme");
    themeSwitch.classList.add("on");
    themeSwitch.setAttribute("aria-checked", "true");
  } else {
    themeIcon.setAttribute("href", "#i-moon");
    themeBtn.setAttribute("aria-label", "switch to dark theme");
    themeSwitch.classList.remove("on");
    themeSwitch.setAttribute("aria-checked", "false");
  }
}

// get saved theme, or follow the device setting on the first visit
function loadTheme() {
  const saved = readStorage(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

// switch theme and save it
function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  // fade colours only while switching, so normal hovers stay fast
  root.classList.add("theme-transition");
  applyTheme(newTheme);
  clearTimeout(toggleTheme.timer);
  toggleTheme.timer = setTimeout(function () {
    root.classList.remove("theme-transition");
  }, 360);
  writeStorage(THEME_KEY, newTheme);
}


// filter, search and sort

// pick tasks for the current view
function filterByView(list) {
  if (currentView === "today") {
    return list.filter(isDueToday);
  }
  if (currentView === "upcoming") {
    return list.filter(isUpcoming);
  }
  if (currentView === "completed") {
    return list.filter(function (task) {
      return task.status === "completed";
    });
  }
  return list;
}

// search tasks
function searchTasks(list) {
  const text = filters.search.trim().toLowerCase();
  if (text === "") {
    return list;
  }

  return list.filter(function (task) {
    return (
      task.title.toLowerCase().includes(text) ||
      task.description.toLowerCase().includes(text) ||
      task.category.toLowerCase().includes(text)
    );
  });
}

// filter tasks
function filterTasks(list) {
  return list.filter(function (task) {
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (filters.category !== "all" && task.category !== filters.category) {
      return false;
    }
    if (filters.due === "today" && !isDueToday(task)) {
      return false;
    }
    if (filters.due === "upcoming" && !isUpcoming(task)) {
      return false;
    }
    if (filters.due === "overdue" && !isOverdue(task)) {
      return false;
    }
    return true;
  });
}

// sort tasks
function sortTasks(list) {
  const sorted = list.slice();

  sorted.sort(function (a, b) {
    if (filters.sort === "oldest") {
      return a.id - b.id;
    }

    if (filters.sort === "due") {
      // tasks without a due date go last
      if (!a.dueDate && !b.dueDate) {
        return 0;
      }
      if (!a.dueDate) {
        return 1;
      }
      if (!b.dueDate) {
        return -1;
      }
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (filters.sort === "priority") {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    if (filters.sort === "alphabetical") {
      return a.title.localeCompare(b.title);
    }

    // newest first
    return b.id - a.id;
  });

  return sorted;
}

// get the tasks that should be shown
function getVisibleTasks() {
  let list = tasks;
  list = filterByView(list);
  list = searchTasks(list);
  list = filterTasks(list);
  list = sortTasks(list);
  return list;
}

// check if any filter is active
function hasActiveFilters() {
  return (
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.due !== "all"
  );
}


// rendering

// short date for cards, like 15 nov (year only when it is not this year)
function formatShortDate(dateString) {
  const parts = dateString.split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const options = { day: "numeric", month: "short" };
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-GB", options);
}

// describe when a task is due, like today, tomorrow or 3 days overdue
function describeDue(task) {
  if (!task.dueDate) {
    return "";
  }
  const today = new Date(getTodayString());
  const due = new Date(task.dueDate);
  const days = Math.round((due - today) / 86400000);

  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Tomorrow";
  }
  if (days === -1) {
    return "Yesterday";
  }
  return formatShortDate(task.dueDate);
}

// build html for one task card
function createTaskCard(task, canDrag) {
  const isDone = task.status === "completed";
  let dueClass = "";
  let dueText = describeDue(task);

  if (isOverdue(task)) {
    dueClass = "due-overdue";
    dueText = dueText + " · Overdue";
  } else if (isDueToday(task) && !isDone) {
    dueClass = "due-today";
  }

  const description = task.description
    ? `<p class="task-desc">${escapeHtml(task.description)}</p>`
    : "";

  const dueMeta = task.dueDate
    ? `<span class="meta ${dueClass}" title="Due ${formatDate(task.dueDate)}">${icon("i-calendar")}${dueText}</span>`
    : "";

  const completeAction = isDone ? "restore" : "complete";
  const completeLabel = isDone ? "Restore task" : "Complete task";
  const draggableAttr = canDrag ? 'draggable="true"' : "";

  // options for the move select box
  const moveOptions = statuses
    .map(function (status) {
      const selected = status === task.status ? "selected" : "";
      return `<option value="${status}" ${selected}>${statusLabels[status]}</option>`;
    })
    .join("");

  return `
    <article class="task-card ${isDone ? "is-completed" : ""}" data-id="${task.id}" data-priority="${task.priority}" ${draggableAttr}>
      <button type="button" class="check" data-action="${completeAction}" data-id="${task.id}" aria-label="${completeLabel}: ${escapeHtml(task.title)}" title="${completeLabel}">
        ${icon("i-check")}
      </button>

      <div class="task-body">
        <h3 class="task-title"><span class="task-title-text">${escapeHtml(task.title)}</span></h3>
        ${description}

        <div class="card-meta">
          <span class="meta prio-${task.priority}" title="${capitalize(task.priority)} priority">
            <span class="prio-bars" aria-hidden="true"><i></i><i></i><i></i></span>${capitalize(task.priority)}
          </span>
          ${dueMeta}
          <span class="meta meta-cat"><span class="category-dot dot-${task.category}"></span>${capitalize(task.category)}</span>
          <label class="visually-hidden" for="move-${task.id}">Status of ${escapeHtml(task.title)}</label>
          <select class="move-select" id="move-${task.id}" data-id="${task.id}">
            ${moveOptions}
          </select>
        </div>
      </div>

      <div class="card-actions">
        <button type="button" class="action-btn action-edit" data-action="edit" data-id="${task.id}" aria-label="Edit task: ${escapeHtml(task.title)}" title="Edit">
          ${icon("i-edit")}
        </button>
        <button type="button" class="action-btn action-delete" data-action="delete" data-id="${task.id}" aria-label="Delete task: ${escapeHtml(task.title)}" title="Delete">
          ${icon("i-trash")}
        </button>
      </div>
    </article>
  `;
}

// show tasks in the kanban columns
function renderBoard(visibleTasks) {
  statuses.forEach(function (status) {
    const columnTasks = visibleTasks.filter(function (task) {
      return task.status === status;
    });

    const listElement = document.getElementById("list-" + status);
    const countElement = document.getElementById("column-count-" + status);

    countElement.textContent = columnTasks.length;

    if (columnTasks.length === 0) {
      listElement.innerHTML = '<p class="column-empty">Nothing here yet. Drag a task in.</p>';
      return;
    }

    listElement.innerHTML = columnTasks
      .map(function (task) {
        return createTaskCard(task, true);
      })
      .join("");
  });
}

// show tasks in a simple grid
function renderList(visibleTasks) {
  // sorted by due date, the list reads like a schedule with day headings
  const groupByDay = filters.sort === "due" && currentView !== "completed";

  if (!groupByDay) {
    taskGrid.innerHTML = visibleTasks
      .map(function (task) {
        return createTaskCard(task, false);
      })
      .join("");
    return;
  }

  const groups = [];
  visibleTasks.forEach(function (task) {
    let key = "none";
    let title = "No due date";
    let date = "";
    if (task.dueDate && isOverdue(task)) {
      key = "overdue";
      title = "Overdue";
    } else if (task.dueDate) {
      key = task.dueDate;
      title = dayHeading(task.dueDate);
      // days far away read better as a date
      if (daysFromToday(task.dueDate) > 6 || daysFromToday(task.dueDate) < 0) {
        title = shortDayDate(task.dueDate);
      } else {
        date = headingDate(task.dueDate);
      }
    }
    let group = groups.find(function (item) {
      return item.key === key;
    });
    if (!group) {
      group = { key: key, title: title, date: date, tasks: [] };
      groups.push(group);
    }
    group.tasks.push(task);
  });

  taskGrid.innerHTML = groups
    .map(function (group) {
      return `
        <section class="schedule-group ${group.key === "overdue" ? "is-overdue" : ""}" aria-label="${group.title}">
          <h3 class="schedule-day"><span>${group.title}</span>${group.date ? `<span class="agenda-date">${group.date}</span>` : ""}<span class="schedule-count">${group.tasks.length}</span></h3>
          <div class="schedule-items">${group.tasks.map(function (task) { return createTaskCard(task, false); }).join("")}</div>
        </section>
      `;
    })
    .join("");
}

// get the empty state message
function getEmptyMessage() {
  if (tasks.length === 0) {
    return "No tasks yet. Create your first task.";
  }
  if (filters.search.trim() !== "") {
    return "No matching tasks found.";
  }
  if (!hasActiveFilters()) {
    if (currentView === "today") {
      return "No tasks due today.";
    }
    if (currentView === "completed") {
      return "You haven't completed any tasks yet.";
    }
    if (currentView === "upcoming") {
      return "No upcoming tasks.";
    }
  }
  return "No matching tasks found.";
}

// show tasks
function renderTasks() {
  // settings and focus pages have no task list
  if (currentView === "settings" || currentView === "focus") {
    boardView.hidden = true;
    taskListView.hidden = true;
    emptyState.hidden = true;
    return;
  }

  const visibleTasks = getVisibleTasks();
  const useBoard = currentView === "dashboard" || currentView === "all";

  // nothing to show
  if (visibleTasks.length === 0) {
    boardView.hidden = true;
    taskListView.hidden = true;
    emptyState.hidden = false;
    emptyText.textContent = getEmptyMessage();
    emptyAddBtn.hidden = tasks.length !== 0;
    return;
  }

  emptyState.hidden = true;

  if (useBoard) {
    boardView.hidden = false;
    taskListView.hidden = true;
    renderBoard(visibleTasks);
  } else {
    boardView.hidden = true;
    taskListView.hidden = false;
    renderList(visibleTasks);
  }
}

// show or hide sections for the current view
function updateViewLayout() {
  dashboardSection.hidden = currentView !== "dashboard";
  settingsView.hidden = currentView !== "settings";
  focusView.hidden = currentView !== "focus";
  toolbar.hidden = currentView === "settings" || currentView === "focus";

  // distraction-free mode only makes sense on the focus page
  if (currentView !== "focus") {
    setImmersive(false);
  }
}

// highlight the active menu item
function updateSidebar() {
  const categoryMode = currentView === "all" && filters.category !== "all";

  navItems.forEach(function (item) {
    const isActive = item.dataset.view === currentView && !categoryMode;
    item.classList.toggle("active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  categoryButtons.forEach(function (button) {
    button.classList.toggle("active", categoryMode && button.dataset.category === filters.category);
  });
}

// update the page title
function updatePageTitle() {
  let title = pageTitles[currentView];

  if (currentView === "all" && filters.category !== "all") {
    title = capitalize(filters.category) + " tasks";
  }

  pageTitle.textContent = title;
  document.title = getTimerTitlePrefix() + title + " | HazFocus";
}

// update sidebar counts
function updateCounts() {
  navCountAll.textContent = tasks.length;
  navCountToday.textContent = tasks.filter(isDueToday).length;
  navCountUpcoming.textContent = tasks.filter(isUpcoming).length;
  navCountCompleted.textContent = tasks.filter(function (task) {
    return task.status === "completed";
  }).length;

  // count tasks in each category
  const counts = tasks.reduce(function (result, task) {
    result[task.category] = (result[task.category] || 0) + 1;
    return result;
  }, {});

  categoryCounts.forEach(function (element) {
    element.textContent = counts[element.dataset.categoryCount] || 0;
  });
}

// pick singular or plural words
function plural(count, word) {
  return count + " " + word + (count === 1 ? "" : "s");
}

// get a short summary sentence built from the real task data
function getProductivityMessage(total, pending, overdue) {
  if (total === 0) {
    return "A blank page. Add your first task to begin.";
  }
  if (pending === 0) {
    return "Everything is done. Enjoy the quiet.";
  }

  const dueToday = tasks.filter(function (task) {
    return isDueToday(task) && task.status !== "completed";
  }).length;
  const inProgress = tasks.filter(function (task) {
    return task.status === "inprogress";
  }).length;
  const attention = dueToday + overdue;

  if (attention > 0) {
    const overdueText = overdue > 0 ? `, ${overdue} of them overdue` : "";
    return `${plural(attention, "task")} ${attention === 1 ? "needs" : "need"} you today${overdueText}.`;
  }
  if (inProgress > 0) {
    return `${plural(inProgress, "task")} in progress, nothing due today.`;
  }
  return `${plural(pending, "task")} waiting, nothing due today.`;
}

// update statistics
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(function (task) {
    return task.status === "completed";
  }).length;
  const pending = total - completed;
  const overdue = tasks.filter(isOverdue).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  statToday.textContent = tasks.filter(function (task) {
    return isDueToday(task) && task.status !== "completed";
  }).length;
  statCompleted.textContent = completed;
  statPending.textContent = pending;
  statOverdue.textContent = overdue;

  progressText.textContent = `${completed} of ${total} tasks completed`;
  progressPercent.textContent = percent + "%";
  progressFill.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", percent);
  productivityMessage.textContent = getProductivityMessage(total, pending, overdue, percent);
  statOverdueWrap.classList.toggle("has-overdue", overdue > 0);
}

// date helpers for the agenda and schedule

// turn yyyy-mm-dd into a local date
function parseDate(dateString) {
  const parts = dateString.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// whole days from today, negative for the past
function daysFromToday(dateString) {
  return Math.round((parseDate(dateString) - parseDate(getTodayString())) / 86400000);
}

// a heading like today, tomorrow or monday
function dayHeading(dateString) {
  const days = daysFromToday(dateString);
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Tomorrow";
  }
  return parseDate(dateString).toLocaleDateString("en-GB", { weekday: "long" });
}

// date shown next to a day heading, without repeating the weekday
function headingDate(dateString) {
  const days = daysFromToday(dateString);
  if (days === 0 || days === 1) {
    return shortDayDate(dateString);
  }
  return parseDate(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// a short date like sun 15 nov
function shortDayDate(dateString) {
  return parseDate(dateString).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// one row in the agenda
function agendaRow(task) {
  return `
    <li>
      <button type="button" class="focus-row" data-action="edit" data-id="${task.id}" aria-label="Open task: ${escapeHtml(task.title)}">
        <span class="meta prio-${task.priority}" title="${capitalize(task.priority)} priority"><span class="prio-bars" aria-hidden="true"><i></i><i></i><i></i></span></span>
        <span class="focus-title">${escapeHtml(task.title)}</span>
        <span class="agenda-cat"><span class="category-dot dot-${task.category}"></span>${capitalize(task.category)}</span>
      </button>
    </li>
  `;
}

// overdue, today and the next six days, most important first
const AGENDA_LIMIT = 8;

function renderAgenda() {
  const open = tasks
    .filter(function (task) {
      return task.status !== "completed" && task.dueDate && daysFromToday(task.dueDate) <= 6;
    })
    .sort(function (a, b) {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  if (open.length === 0) {
    agenda.innerHTML = '<p class="focus-empty">Nothing due in the next 7 days.</p>';
    return;
  }

  // group rows under overdue or a day heading
  const groups = [];
  open.slice(0, AGENDA_LIMIT).forEach(function (task) {
    const overdue = isOverdue(task);
    const key = overdue ? "overdue" : task.dueDate;
    let group = groups.find(function (item) {
      return item.key === key;
    });
    if (!group) {
      group = {
        key: key,
        title: overdue ? "Overdue" : dayHeading(task.dueDate),
        date: overdue ? "" : headingDate(task.dueDate),
        overdue: overdue,
        tasks: []
      };
      groups.push(group);
    }
    group.tasks.push(task);
  });

  const more = open.length - AGENDA_LIMIT;
  agenda.innerHTML = groups
    .map(function (group) {
      return `
        <section class="agenda-group ${group.overdue ? "is-overdue" : ""}">
          <h3 class="agenda-day"><span>${group.title}</span>${group.date ? `<span class="agenda-date">${group.date}</span>` : ""}</h3>
          <ol class="focus-list">${group.tasks.map(agendaRow).join("")}</ol>
        </section>
      `;
    })
    .join("") + (more > 0 ? `<p class="agenda-more">${plural(more, "more task")} this week in Upcoming</p>` : "");
}

// progress for each category that has tasks
function renderAreas() {
  const rows = categories
    .map(function (category) {
      const list = tasks.filter(function (task) {
        return task.category === category;
      });
      const done = list.filter(function (task) {
        return task.status === "completed";
      }).length;
      return { category: category, total: list.length, done: done };
    })
    .filter(function (row) {
      return row.total > 0;
    });

  areasBlock.hidden = rows.length === 0;
  areaList.innerHTML = rows
    .map(function (row) {
      const percent = Math.round((row.done / row.total) * 100);
      return `
        <li>
          <button type="button" class="area-row" data-area="${row.category}" aria-label="${capitalize(row.category)}: ${row.done} of ${row.total} done">
            <span class="area-name"><span class="category-dot dot-${row.category}"></span>${capitalize(row.category)}</span>
            <span class="area-count">${row.done}/${row.total}</span>
            <span class="area-bar" aria-hidden="true"><span class="area-fill dot-${row.category}" style="width: ${percent}%"></span></span>
          </button>
        </li>
      `;
    })
    .join("");
}

// tasks completed and focus minutes for the last seven days
function getWeekActivity() {
  const history = getFocusHistory();
  const days = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = formatDateInput(date);
    days.push({
      key: key,
      label: date.toLocaleDateString("en-GB", { weekday: "short" }),
      long: shortDayDate(key),
      tasks: tasks.filter(function (task) {
        return task.completedAt === key;
      }).length,
      minutes: history[key] || 0,
      isToday: offset === 0
    });
  }
  return days;
}

// small column chart, one column per day
function renderWeek() {
  const days = getWeekActivity();
  const totalTasks = days.reduce(function (sum, day) { return sum + day.tasks; }, 0);
  const totalMinutes = days.reduce(function (sum, day) { return sum + day.minutes; }, 0);
  const peak = Math.max.apply(null, days.map(function (day) { return day.tasks; }));
  const scale = Math.max(peak, 1);

  if (totalTasks === 0 && totalMinutes === 0) {
    weekSummary.textContent = "";
  } else {
    const parts = [plural(totalTasks, "task")];
    if (totalMinutes > 0) {
      parts.push(totalMinutes + " min focus");
    }
    weekSummary.textContent = parts.join(" · ");
  }

  // label only the peak and today, the tooltip and table carry the rest
  let peakLabelled = false;
  weekChart.innerHTML = days
    .map(function (day) {
      const height = day.tasks === 0 ? 0 : Math.max(8, Math.round((day.tasks / scale) * 100));
      let label = "";
      if (day.tasks > 0 && (day.isToday || (day.tasks === peak && !peakLabelled))) {
        label = `<span class="week-value">${day.tasks}</span>`;
        if (day.tasks === peak) {
          peakLabelled = true;
        }
      }
      const tip = `${day.long}: ${plural(day.tasks, "task")} completed${day.minutes > 0 ? `, ${day.minutes} min focus` : ""}`;
      return `
        <div class="week-day ${day.isToday ? "is-today" : ""}" tabindex="0" role="img" aria-label="${tip}" data-tip="${tip}">
          <div class="week-plot">
            ${label}
            <span class="week-bar" style="height: ${height}%"></span>
          </div>
          <span class="week-label">${day.isToday ? "Today" : day.label}</span>
        </div>
      `;
    })
    .join("");

  weekTableBody.innerHTML = days
    .map(function (day) {
      return `<tr><th scope="row">${day.long}</th><td>${day.tasks}</td><td>${day.minutes}</td></tr>`;
    })
    .join("");

  weekChart.classList.toggle("is-empty", totalTasks === 0);
}

// summary strip above the board when one category is open
function renderAreaSummary() {
  const category = currentView === "all" ? filters.category : "all";
  if (category === "all") {
    areaSummary.hidden = true;
    return;
  }

  const list = tasks.filter(function (task) {
    return task.category === category;
  });
  const done = list.filter(function (task) {
    return task.status === "completed";
  }).length;
  const open = list.length - done;
  const percent = list.length === 0 ? 0 : Math.round((done / list.length) * 100);
  const next = list
    .filter(function (task) {
      return task.status !== "completed" && task.dueDate;
    })
    .sort(function (a, b) {
      return a.dueDate.localeCompare(b.dueDate);
    })[0];

  let nextText = "No upcoming deadline";
  if (next) {
    nextText = isOverdue(next)
      ? `Overdue: ${escapeHtml(next.title)}`
      : `Next due ${dayHeading(next.dueDate).toLowerCase() === "today" ? "today" : shortDayDate(next.dueDate)}: ${escapeHtml(next.title)}`;
  }

  areaSummary.hidden = false;
  areaSummary.innerHTML = `
    <div class="area-summary-head">
      <span class="category-dot dot-${category}"></span>
      <p class="area-summary-stats"><strong>${open}</strong> open <span aria-hidden="true">·</span> <strong>${done}</strong> done <span aria-hidden="true">·</span> ${percent}%</p>
    </div>
    <div class="area-bar" aria-hidden="true"><span class="area-fill dot-${category}" style="width: ${percent}%"></span></div>
    <p class="area-summary-next ${next && isOverdue(next) ? "is-overdue" : ""}">${nextText}</p>
  `;
}

// update the whole page
function renderApp() {
  updateViewLayout();
  updateSidebar();
  updatePageTitle();
  updateStatistics();
  updateCounts();
  updateFilterState();
  if (currentView === "dashboard") {
    renderAgenda();
    renderAreas();
    renderWeek();
  }
  renderAreaSummary();
  if (currentView === "focus") {
    renderFocusTasks();
  }
  renderTasks();
}

// show which filters are active
function updateFilterState() {
  let active = 0;
  filterSelects.forEach(function (select) {
    const isSet = select.value !== "all";
    select.parentElement.classList.toggle("is-set", isSet);
    if (isSet) {
      active += 1;
    }
  });
  filterBadge.textContent = active;
  filterBadge.hidden = active === 0;

  const useBoard = currentView === "dashboard" || currentView === "all";
  toolbarTitle.textContent = useBoard ? "Board" : plural(getVisibleTasks().length, "task");
}


// task actions

// add new task
function addTask(data) {
  const newTask = {
    id: Date.now(),
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    dueDate: data.dueDate,
    status: data.status,
    createdAt: getTodayString(),
    completedAt: data.status === "completed" ? getTodayString() : ""
  };

  tasks.push(newTask);
  saveTasks();
  renderApp();
  showToast("Task added");
}

// update task
function editTask(id, data) {
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  if (!task) {
    return;
  }

  task.title = data.title;
  task.description = data.description;
  task.category = data.category;
  task.priority = data.priority;
  task.dueDate = data.dueDate;
  setTaskStatus(task, data.status);

  saveTasks();
  renderApp();
  showToast("Task updated");
}

// delete task
function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  renderApp();
  showToast("Task deleted", "delete");
}

// move task to another column
function moveTask(id, newStatus) {
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  if (!task || task.status === newStatus) {
    return;
  }

  const wasCompleted = task.status === "completed";
  setTaskStatus(task, newStatus);

  saveTasks();
  renderApp();

  if (newStatus === "completed") {
    showToast(toastMessages.completed);
  } else if (wasCompleted) {
    showToast("Task restored");
  } else {
    showToast(toastMessages[newStatus]);
  }
}

// change status and remember the day a task was completed
function setTaskStatus(task, newStatus) {
  if (newStatus === "completed" && task.status !== "completed") {
    task.completedAt = getTodayString();
  } else if (newStatus !== "completed") {
    task.completedAt = "";
  }
  task.status = newStatus;
}

// complete task
function completeTask(id) {
  moveTask(id, "completed");
}

// restore a completed task
function restoreTask(id) {
  moveTask(id, "todo");
}

// ask before deleting a task
function confirmDeleteTask(id) {
  openConfirm("Delete task", "Are you sure you want to delete this task?", "Delete", function () {
    deleteTask(id);
  });
}


// task modal and form

// remove error messages
function clearFormErrors() {
  titleError.textContent = "";
  dueError.textContent = "";
  titleInput.classList.remove("input-error");
  dueInput.classList.remove("input-error");
  titleInput.removeAttribute("aria-invalid");
  dueInput.removeAttribute("aria-invalid");
}

// show an error under a field
function showFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  input.classList.add("input-error");
  input.setAttribute("aria-invalid", "true");
}

// open the task modal
function openTaskModal(taskId) {
  taskForm.reset();
  clearFormErrors();

  if (taskId) {
    // edit mode
    const task = tasks.find(function (item) {
      return item.id === taskId;
    });

    if (!task) {
      return;
    }

    editingId = task.id;
    modalTitle.textContent = "Edit task";
    submitBtn.textContent = "Save changes";
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    categoryInput.value = task.category;
    priorityInput.value = task.priority;
    dueInput.value = task.dueDate;
    statusInput.value = task.status;
  } else {
    // add mode
    editingId = null;
    modalTitle.textContent = "New task";
    submitBtn.textContent = "Add task";
    statusInput.value = "todo";
  }

  // new tasks cannot pick a past date in the calendar
  if (editingId === null) {
    dueInput.min = getTodayString();
  } else {
    dueInput.removeAttribute("min");
  }

  taskModal.showModal();
  titleInput.focus();
}

// close the task modal
function closeTaskModal() {
  taskModal.close();
  editingId = null;
}

// check the form
function validateForm() {
  let isValid = true;
  clearFormErrors();

  const title = titleInput.value.trim();

  if (title === "") {
    showFieldError(titleInput, titleError, "Please enter a task title.");
    isValid = false;
  } else if (title.length < 3) {
    showFieldError(titleInput, titleError, "Title must be at least 3 characters.");
    isValid = false;
  }

  // new tasks cannot have a due date in the past
  if (dueInput.value !== "" && editingId === null && dueInput.value < getTodayString()) {
    showFieldError(dueInput, dueError, "Due date cannot be in the past.");
    isValid = false;
  }

  // focus the first field with an error
  if (!isValid) {
    if (titleInput.classList.contains("input-error")) {
      titleInput.focus();
    } else {
      dueInput.focus();
    }
  }

  return isValid;
}

// save the form
function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    dueDate: dueInput.value,
    status: statusInput.value
  };

  if (editingId !== null) {
    editTask(editingId, data);
  } else {
    addTask(data);
  }

  closeTaskModal();
}


// confirm modal

// open the confirm modal
// isDanger makes the button red, use it for delete actions
function openConfirm(title, message, buttonText, action, isDanger) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmOkBtn.textContent = buttonText;
  confirmOkBtn.className = isDanger === false ? "btn btn-primary" : "btn btn-danger";
  confirmAction = action;
  confirmModal.showModal();
}

// run the confirmed action
function handleConfirmOk() {
  const action = confirmAction;
  confirmAction = null;
  confirmModal.close();

  if (action) {
    action();
  }
}

// remember where the mouse was pressed
// so selecting text in an input and releasing outside does not close the modal
let pressedOnBackdrop = false;

function handleModalMouseDown(event) {
  pressedOnBackdrop = event.target === event.currentTarget;
}

// close a modal when the dark area is clicked
function closeOnBackdropClick(event) {
  if (pressedOnBackdrop && event.target === event.currentTarget) {
    event.currentTarget.close();
  }
  pressedOnBackdrop = false;
}


// drag and drop

// start dragging a card
function handleDragStart(event) {
  const card = event.target.closest(".task-card");
  if (!card) {
    return;
  }

  draggedId = Number(card.dataset.id);
  card.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(draggedId));
}

// remove drag styles
function clearDragState() {
  draggedId = null;

  document.querySelectorAll(".dragging").forEach(function (card) {
    card.classList.remove("dragging");
  });

  dropLists.forEach(function (list) {
    list.classList.remove("drag-over");
  });
}

// allow dropping on a column
function handleDragOver(event) {
  if (draggedId === null) {
    return;
  }
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

// remove highlight when leaving a column
function handleDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("drag-over");
  }
}

// drop a card into a column
function handleDrop(event) {
  event.preventDefault();

  const newStatus = event.currentTarget.dataset.status;
  const id = draggedId;

  clearDragState();

  if (id !== null) {
    moveTask(id, newStatus);
  }
}


// touch drag and drop
// a long press picks up a card, moving the finger drags it, lifting drops it

const touchDrag = {
  timer: null,
  card: null,
  ghost: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  lastX: 0,
  lastY: 0,
  overList: null,
  scrollFrame: null,
  active: false
};

const LONG_PRESS_MS = 350;
const MOVE_TOLERANCE = 8;
const EDGE_SIZE = 48;

// wait for a long press on a card
function handleTouchStart(event) {
  if (event.touches.length !== 1) {
    cancelTouchDrag();
    return;
  }

  const card = event.target.closest(".task-card[draggable='true']");
  // buttons and the status select keep their normal tap behaviour
  if (!card || event.target.closest("button, select, label")) {
    return;
  }

  const touch = event.touches[0];
  touchDrag.card = card;
  touchDrag.startX = touch.clientX;
  touchDrag.startY = touch.clientY;
  touchDrag.lastX = touch.clientX;
  touchDrag.lastY = touch.clientY;
  touchDrag.timer = setTimeout(startTouchDrag, LONG_PRESS_MS);
}

// pick up the card after the long press
function startTouchDrag() {
  const card = touchDrag.card;
  if (!card) {
    return;
  }

  const rect = card.getBoundingClientRect();
  touchDrag.active = true;
  touchDrag.offsetX = touchDrag.startX - rect.left;
  touchDrag.offsetY = touchDrag.startY - rect.top;
  draggedId = Number(card.dataset.id);

  // a floating copy follows the finger
  const ghost = card.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.removeAttribute("draggable");
  ghost.setAttribute("aria-hidden", "true");
  ghost.querySelectorAll("[id]").forEach(function (element) {
    element.removeAttribute("id");
  });
  ghost.style.width = rect.width + "px";
  document.body.appendChild(ghost);
  touchDrag.ghost = ghost;

  card.classList.add("dragging");
  boardView.classList.add("is-touch-dragging");
  document.body.classList.add("touch-dragging");
  moveGhost(touchDrag.lastX, touchDrag.lastY);

  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  autoScrollBoard();
}

// place the floating card under the finger
function moveGhost(x, y) {
  touchDrag.ghost.style.transform = `translate(${x - touchDrag.offsetX}px, ${y - touchDrag.offsetY}px) rotate(1.5deg)`;
}

// highlight the column under the finger
function updateTouchTarget(x, y) {
  const element = document.elementFromPoint(x, y);
  const list = element ? element.closest(".task-list") : null;
  const column = element ? element.closest(".column") : null;
  const target = list || (column ? column.querySelector(".task-list") : null);

  if (target === touchDrag.overList) {
    return;
  }
  if (touchDrag.overList) {
    touchDrag.overList.classList.remove("drag-over");
  }
  if (target) {
    target.classList.add("drag-over");
  }
  touchDrag.overList = target;
}

// scroll the board sideways and the page up or down near the edges
function autoScrollBoard() {
  if (!touchDrag.active) {
    return;
  }

  const x = touchDrag.lastX;
  const y = touchDrag.lastY;
  const boardRect = boardView.getBoundingClientRect();
  let scrolled = false;

  if (boardView.scrollWidth > boardView.clientWidth) {
    if (x < boardRect.left + EDGE_SIZE) {
      boardView.scrollLeft -= 6;
      scrolled = true;
    } else if (x > boardRect.right - EDGE_SIZE) {
      boardView.scrollLeft += 6;
      scrolled = true;
    }
  }

  if (y < EDGE_SIZE + 60) {
    window.scrollBy(0, -10);
    scrolled = true;
  } else if (y > window.innerHeight - EDGE_SIZE - 70) {
    window.scrollBy(0, 10);
    scrolled = true;
  }

  if (scrolled) {
    updateTouchTarget(x, y);
  }
  touchDrag.scrollFrame = requestAnimationFrame(autoScrollBoard);
}

// follow the finger, or cancel the long press if the user is scrolling
function handleTouchMove(event) {
  if (!touchDrag.card) {
    return;
  }

  const touch = event.touches[0];
  touchDrag.lastX = touch.clientX;
  touchDrag.lastY = touch.clientY;

  if (!touchDrag.active) {
    const movedX = Math.abs(touch.clientX - touchDrag.startX);
    const movedY = Math.abs(touch.clientY - touchDrag.startY);
    if (movedX > MOVE_TOLERANCE || movedY > MOVE_TOLERANCE) {
      cancelTouchDrag();
    }
    return;
  }

  // stop the page from scrolling while a card is held
  event.preventDefault();
  moveGhost(touch.clientX, touch.clientY);
  updateTouchTarget(touch.clientX, touch.clientY);
}

// drop the card on the column under the finger
function handleTouchEnd(event) {
  if (!touchDrag.active) {
    cancelTouchDrag();
    return;
  }

  event.preventDefault();
  const target = touchDrag.overList;
  const id = draggedId;
  cancelTouchDrag();

  if (target && id !== null) {
    moveTask(id, target.dataset.status);
  }
}

// clean up after a touch drag
function cancelTouchDrag() {
  clearTimeout(touchDrag.timer);
  cancelAnimationFrame(touchDrag.scrollFrame);

  if (touchDrag.ghost) {
    touchDrag.ghost.remove();
  }

  touchDrag.timer = null;
  touchDrag.card = null;
  touchDrag.ghost = null;
  touchDrag.overList = null;
  touchDrag.active = false;

  boardView.classList.remove("is-touch-dragging");
  document.body.classList.remove("touch-dragging");
  clearDragState();
}


// other event handlers

// handle clicks on card buttons
function handleCardClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "complete") {
    const card = button.closest(".task-card");
    if (card && !prefersReducedMotion()) {
      // let the check and strike animation play before the card moves
      card.classList.add("is-completing");
      button.disabled = true;
      setTimeout(function () {
        completeTask(id);
      }, 380);
    } else {
      completeTask(id);
    }
  } else if (action === "restore") {
    restoreTask(id);
  } else if (action === "edit") {
    openTaskModal(id);
  } else if (action === "delete") {
    confirmDeleteTask(id);
  }
}

// handle the move select box on a card
function handleMoveChange(event) {
  if (!event.target.classList.contains("move-select")) {
    return;
  }
  moveTask(Number(event.target.dataset.id), event.target.value);
}

// search while typing
function handleSearch() {
  filters.search = searchInput.value;

  // leave settings and focus so results are visible
  if (currentView === "settings" || currentView === "focus") {
    currentView = "all";
  }

  renderApp();
}

// read filter boxes
function handleFilterChange() {
  filters.status = filterStatus.value;
  filters.priority = filterPriority.value;
  filters.category = filterCategory.value;
  filters.due = filterDue.value;
  filters.sort = sortSelect.value;

  saveFilters();
  renderApp();
}

// reset all filters
function clearFilters() {
  filters.search = "";
  filters.status = "all";
  filters.priority = "all";
  filters.category = "all";
  filters.due = "all";
  filters.sort = currentView === "upcoming" ? "due" : "newest";

  syncFilterControls();
  saveFilters();
  renderApp();
}

// open the mobile sidebar
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
  menuBtn.setAttribute("aria-expanded", "true");

  // move keyboard focus into the menu
  const activeItem = sidebar.querySelector(".nav-item.active, .category-item.active") || sidebar.querySelector("button");
  activeItem.focus();
}

// close the mobile sidebar
function closeSidebar() {
  const wasOpen = sidebar.classList.contains("open");

  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  menuBtn.setAttribute("aria-expanded", "false");

  // give focus back to the menu button if focus was inside the menu
  if (wasOpen && sidebar.contains(document.activeElement)) {
    menuBtn.focus();
  }
}

// change the current view
function setView(view) {
  currentView = view;

  // all tasks should show every category again
  if (view === "all") {
    filters.category = "all";
  }

  // upcoming tasks are sorted by nearest due date
  if (view === "upcoming") {
    filters.sort = "due";
  }

  syncFilterControls();
  saveFilters();
  closeSidebar();
  renderApp();
  playViewTransition();
  window.scrollTo(0, 0);
}

// fade the content in after the view changes
function playViewTransition() {
  content.classList.remove("view-enter");
  // force a reflow so the animation can restart
  void content.offsetWidth;
  content.classList.add("view-enter");
}

// filter by a category from the sidebar
function selectCategory(category) {
  if (currentView === "all" && filters.category === category) {
    filters.category = "all";
  } else {
    filters.category = category;
  }

  currentView = "all";

  syncFilterControls();
  saveFilters();
  closeSidebar();
  renderApp();
  playViewTransition();
  window.scrollTo(0, 0);
}


// start the app

// add all event listeners
function setupEventListeners() {
  // sidebar
  menuBtn.addEventListener("click", openSidebar);
  overlay.addEventListener("click", closeSidebar);

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      setView(item.dataset.view);
    });
  });

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectCategory(button.dataset.category);
    });
  });

  // header
  searchInput.addEventListener("input", handleSearch);
  themeBtn.addEventListener("click", toggleTheme);
  themeSwitch.addEventListener("click", toggleTheme);

  addTaskBtn.addEventListener("click", function () {
    openTaskModal();
  });

  emptyAddBtn.addEventListener("click", function () {
    openTaskModal();
  });

  mobileAddBtn.addEventListener("click", function () {
    openTaskModal();
  });

  // dashboard links like view today
  document.querySelectorAll("[data-goto]").forEach(function (button) {
    button.addEventListener("click", function () {
      setView(button.dataset.goto);
    });
  });

  // agenda rows open the task
  agenda.addEventListener("click", handleCardClick);

  // area rows open the category
  areaList.addEventListener("click", function (event) {
    const row = event.target.closest("[data-area]");
    if (row) {
      selectCategory(row.dataset.area);
    }
  });

  // show a hairline under the header once the page scrolls
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 4);
  }, { passive: true });

  // open and close the filter panel on small screens
  filterToggle.addEventListener("click", function () {
    const isOpen = toolbar.classList.toggle("filters-open");
    filterToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // filters
  [filterStatus, filterPriority, filterCategory, filterDue, sortSelect].forEach(function (select) {
    select.addEventListener("change", handleFilterChange);
  });

  clearFiltersBtn.addEventListener("click", clearFilters);

  // task cards
  boardView.addEventListener("click", handleCardClick);
  taskListView.addEventListener("click", handleCardClick);
  boardView.addEventListener("change", handleMoveChange);
  taskListView.addEventListener("change", handleMoveChange);

  // drag and drop
  boardView.addEventListener("dragstart", handleDragStart);
  boardView.addEventListener("dragend", clearDragState);

  // touch drag and drop
  boardView.addEventListener("touchstart", handleTouchStart, { passive: true });
  boardView.addEventListener("touchmove", handleTouchMove, { passive: false });
  boardView.addEventListener("touchend", handleTouchEnd);
  boardView.addEventListener("touchcancel", cancelTouchDrag);

  dropLists.forEach(function (list) {
    list.addEventListener("dragover", handleDragOver);
    list.addEventListener("dragleave", handleDragLeave);
    list.addEventListener("drop", handleDrop);
  });

  // task form
  taskForm.addEventListener("submit", handleFormSubmit);
  closeModalBtn.addEventListener("click", closeTaskModal);
  cancelBtn.addEventListener("click", closeTaskModal);
  titleInput.addEventListener("input", clearFormErrors);
  dueInput.addEventListener("change", clearFormErrors);
  taskModal.addEventListener("mousedown", handleModalMouseDown);
  taskModal.addEventListener("click", closeOnBackdropClick);

  // confirm modal
  confirmOkBtn.addEventListener("click", handleConfirmOk);
  confirmCancelBtn.addEventListener("click", function () {
    confirmModal.close();
  });
  confirmModal.addEventListener("mousedown", handleModalMouseDown);
  confirmModal.addEventListener("click", closeOnBackdropClick);

  // settings
  resetSamplesBtn.addEventListener("click", function () {
    openConfirm("Load sample tasks", "This will replace all your tasks with the sample tasks.", "Load samples", function () {
      tasks = getSampleTasks();
      saveTasks();
      renderApp();
      showToast("Sample tasks loaded");
    }, false);
  });

  deleteAllBtn.addEventListener("click", function () {
    openConfirm("Delete all tasks", "Are you sure you want to delete every task?", "Delete all", function () {
      tasks = [];
      saveTasks();
      renderApp();
      showToast("All tasks deleted", "delete");
    });
  });

  // profile name
  nameForm.addEventListener("submit", handleNameSubmit);

  // keyboard shortcuts
  document.addEventListener("keydown", handleShortcuts);
}

// focus timer
// a pomodoro style timer: focus sessions with short breaks,
// and a long break after every fourth focus session

const focusView = document.getElementById("focus-view");
const modeButtons = document.querySelectorAll(".mode-btn");
const ringProgress = document.getElementById("ring-progress");
const timerTime = document.getElementById("timer-time");
const timerLabel = document.getElementById("timer-label");
const cycleDots = document.getElementById("cycle-dots");
const timerToggle = document.getElementById("timer-toggle");
const timerToggleIcon = document.getElementById("timer-toggle-icon");
const timerToggleText = document.getElementById("timer-toggle-text");
const timerReset = document.getElementById("timer-reset");
const timerSkip = document.getElementById("timer-skip");
const focusTaskSelect = document.getElementById("focus-task-select");
const focusTaskDone = document.getElementById("focus-task-done");
const focusToday = document.getElementById("focus-today");
const immersiveBtn = document.getElementById("immersive-btn");
const immersiveText = document.getElementById("immersive-text");
const navTimer = document.getElementById("nav-timer");
const focusMinutesInput = document.getElementById("focus-minutes");
const shortMinutesInput = document.getElementById("short-minutes");
const longMinutesInput = document.getElementById("long-minutes");
const soundSwitch = document.getElementById("sound-switch");

const SESSIONS_PER_CYCLE = 4;
const RING_LENGTH = 2 * Math.PI * 112;
const modeLabels = { focus: "Focus", short: "Short break", long: "Long break" };

let focusSettings = { focus: 25, short: 5, long: 15, sound: true };
let focusState = {
  mode: "focus",
  status: "idle", // idle, running or paused
  endsAt: 0,
  remaining: 0,
  done: 0, // focus sessions finished in this cycle
  taskId: null
};
let focusLog = { date: "", sessions: 0, minutes: 0 };
let timerInterval = null;
let audioContext = null;

// length of a mode in milliseconds
function getModeLength(mode) {
  return focusSettings[mode] * 60000;
}

// time left in milliseconds
function getRemaining() {
  if (focusState.status === "running") {
    return Math.max(0, focusState.endsAt - Date.now());
  }
  return focusState.remaining;
}

// turn milliseconds into mm:ss
function formatClock(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// keep a whole number inside a range
function clampMinutes(value, max, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }
  return Math.min(number, max);
}

// save and load timer data
function saveFocus() {
  writeStorage(FOCUS_KEY, JSON.stringify(focusState));
}

function saveFocusSettings() {
  writeStorage(FOCUS_SETTINGS_KEY, JSON.stringify(focusSettings));
}

function saveFocusLog() {
  writeStorage(FOCUS_LOG_KEY, JSON.stringify(focusLog));
}

function readJson(key) {
  try {
    return JSON.parse(readStorage(key));
  } catch (error) {
    return null;
  }
}

function loadFocus() {
  const settings = readJson(FOCUS_SETTINGS_KEY);
  if (settings && typeof settings === "object") {
    focusSettings = {
      focus: clampMinutes(settings.focus, 120, 25),
      short: clampMinutes(settings.short, 60, 5),
      long: clampMinutes(settings.long, 60, 15),
      sound: settings.sound !== false
    };
  }

  const log = readJson(FOCUS_LOG_KEY);
  if (log && log.date === getTodayString()) {
    focusLog = {
      date: log.date,
      sessions: Number(log.sessions) || 0,
      minutes: Number(log.minutes) || 0
    };
  } else {
    focusLog = { date: getTodayString(), sessions: 0, minutes: 0 };
  }

  // keep today's minutes in the history as well
  const history = getFocusHistory();
  if (focusLog.minutes > (history[focusLog.date] || 0)) {
    history[focusLog.date] = focusLog.minutes;
    writeStorage(FOCUS_HISTORY_KEY, JSON.stringify(history));
  }

  const state = readJson(FOCUS_KEY);
  if (state && modeLabels[state.mode] && ["idle", "running", "paused"].includes(state.status)) {
    focusState = {
      mode: state.mode,
      status: state.status,
      endsAt: Number(state.endsAt) || 0,
      remaining: Number(state.remaining) || 0,
      done: Math.min(Math.max(Number(state.done) || 0, 0), SESSIONS_PER_CYCLE),
      taskId: state.taskId || null
    };
  }

  if (focusState.status === "idle") {
    focusState.remaining = getModeLength(focusState.mode);
  }

  syncFocusSettingControls();

  // a session that ended while the page was closed
  if (focusState.status === "running") {
    if (getRemaining() === 0) {
      finishSession(false);
    } else {
      startTicking();
    }
  }
  updateTimerDisplay();
}

// minutes focused per day, like { "2026-11-14": 50 }
function getFocusHistory() {
  const saved = readJson(FOCUS_HISTORY_KEY);
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    return {};
  }
  const clean = {};
  Object.keys(saved).forEach(function (key) {
    const minutes = Number(saved[key]);
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && minutes > 0) {
      clean[key] = minutes;
    }
  });
  return clean;
}

// add finished focus minutes to today, only the last 60 days are kept
function addFocusHistory(minutes) {
  const history = getFocusHistory();
  const today = getTodayString();
  history[today] = (history[today] || 0) + minutes;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const oldest = formatDateInput(cutoff);
  Object.keys(history).forEach(function (key) {
    if (key < oldest) {
      delete history[key];
    }
  });
  writeStorage(FOCUS_HISTORY_KEY, JSON.stringify(history));
}

// show the saved lengths in settings
function syncFocusSettingControls() {
  focusMinutesInput.value = focusSettings.focus;
  shortMinutesInput.value = focusSettings.short;
  longMinutesInput.value = focusSettings.long;
  soundSwitch.classList.toggle("on", focusSettings.sound);
  soundSwitch.setAttribute("aria-checked", String(focusSettings.sound));
}

// read new lengths from settings
function handleDurationChange() {
  focusSettings.focus = clampMinutes(focusMinutesInput.value, 120, focusSettings.focus);
  focusSettings.short = clampMinutes(shortMinutesInput.value, 60, focusSettings.short);
  focusSettings.long = clampMinutes(longMinutesInput.value, 60, focusSettings.long);
  syncFocusSettingControls();
  saveFocusSettings();

  // an idle timer picks up the new length straight away
  if (focusState.status === "idle") {
    focusState.remaining = getModeLength(focusState.mode);
    saveFocus();
    updateTimerDisplay();
  }
}

// start, pause or resume
function toggleTimer() {
  if (focusState.status === "running") {
    focusState.remaining = getRemaining();
    focusState.status = "paused";
    stopTicking();
  } else {
    if (focusState.remaining <= 0) {
      focusState.remaining = getModeLength(focusState.mode);
    }
    focusState.endsAt = Date.now() + focusState.remaining;
    focusState.status = "running";
    unlockAudio();
    startTicking();
  }
  saveFocus();
  updateTimerDisplay();
}

// go back to the start of the current session
function resetTimer() {
  stopTicking();
  focusState.status = "idle";
  focusState.remaining = getModeLength(focusState.mode);
  saveFocus();
  updateTimerDisplay();
}

// switch to another mode
function setTimerMode(mode) {
  stopTicking();
  // a full cycle starts again with the next focus session
  if (mode === "focus" && focusState.done >= SESSIONS_PER_CYCLE) {
    focusState.done = 0;
  }
  focusState.mode = mode;
  focusState.status = "idle";
  focusState.remaining = getModeLength(mode);
  saveFocus();
  updateTimerDisplay();
}

// pick the mode that follows the current one
function getNextMode() {
  if (focusState.mode !== "focus") {
    return "focus";
  }
  return focusState.done + 1 >= SESSIONS_PER_CYCLE ? "long" : "short";
}

// end the current session, completed is false when it is skipped
function finishSession(completed) {
  const finishedMode = focusState.mode;
  const nextMode = getNextMode();

  if (finishedMode === "focus") {
    if (completed !== false || getRemaining() === 0) {
      // only count focus time that really happened
      if (focusLog.date !== getTodayString()) {
        focusLog = { date: getTodayString(), sessions: 0, minutes: 0 };
      }
      focusLog.sessions += 1;
      focusLog.minutes += focusSettings.focus;
      saveFocusLog();
      addFocusHistory(focusSettings.focus);
    }
    focusState.done = Math.min(focusState.done + 1, SESSIONS_PER_CYCLE);
  } else if (finishedMode === "long") {
    focusState.done = 0;
  }

  setTimerMode(nextMode);
  return finishedMode;
}

// skip to the next session without counting it
function skipSession() {
  finishSession(false);
}

// the clock reached zero
function completeSession() {
  const finished = finishSession(true);
  playChime();
  const message = finished === "focus"
    ? "Focus session done. Time for a break."
    : "Break over. Ready to focus?";
  showToast(message);
}

// update the clock four times a second
function startTicking() {
  stopTicking();
  timerInterval = setInterval(function () {
    if (getRemaining() === 0) {
      completeSession();
      return;
    }
    updateTimerDisplay();
  }, 250);
}

function stopTicking() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// text for the browser tab while the timer runs
function getTimerTitlePrefix() {
  if (focusState.status !== "running") {
    return "";
  }
  return formatClock(getRemaining()) + " · ";
}

// draw the clock, ring, buttons and labels
function updateTimerDisplay() {
  const remaining = getRemaining();
  const total = getModeLength(focusState.mode);
  const progress = total === 0 ? 0 : 1 - remaining / total;
  const clock = formatClock(remaining);
  const running = focusState.status === "running";

  timerTime.textContent = clock;
  ringProgress.style.strokeDashoffset = String(RING_LENGTH * (1 - progress));
  focusView.dataset.mode = focusState.mode;
  focusView.dataset.status = focusState.status;

  // label like focus 2 of 4
  if (focusState.mode === "focus") {
    timerLabel.textContent = `Focus ${focusState.done + 1} of ${SESSIONS_PER_CYCLE}`;
  } else {
    timerLabel.textContent = modeLabels[focusState.mode];
  }

  // one dot per focus session in the cycle
  let dots = "";
  for (let i = 0; i < SESSIONS_PER_CYCLE; i++) {
    let state = "";
    if (i < focusState.done) {
      state = "is-done";
    } else if (i === focusState.done && focusState.mode === "focus") {
      state = "is-current";
    }
    dots += `<li class="${state}"></li>`;
  }
  cycleDots.innerHTML = dots;
  cycleDots.setAttribute("aria-label", `${focusState.done} of ${SESSIONS_PER_CYCLE} focus sessions done in this cycle`);

  modeButtons.forEach(function (button) {
    button.setAttribute("aria-checked", String(button.dataset.mode === focusState.mode));
  });

  timerToggleIcon.setAttribute("href", running ? "#i-pause" : "#i-play");
  if (running) {
    timerToggleText.textContent = "Pause";
  } else if (focusState.status === "paused") {
    timerToggleText.textContent = "Resume";
  } else {
    timerToggleText.textContent = "Start";
  }

  // small clock next to focus in the sidebar
  navTimer.hidden = focusState.status === "idle";
  navTimer.textContent = clock;

  // today's real focus time
  if (focusLog.date !== getTodayString() || focusLog.sessions === 0) {
    focusToday.textContent = "No focus sessions finished today yet.";
  } else {
    focusToday.textContent = `Today: ${plural(focusLog.sessions, "session")} · ${focusLog.minutes} min focused`;
  }

  document.title = getTimerTitlePrefix() + pageTitle.textContent + " | HazFocus";
}

// fill the working on list with unfinished tasks
function renderFocusTasks() {
  const open = tasks
    .filter(function (task) {
      return task.status !== "completed";
    })
    .sort(function (a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // forget a task that was finished or deleted
  if (focusState.taskId && !open.some(function (task) { return task.id === focusState.taskId; })) {
    focusState.taskId = null;
    saveFocus();
  }

  const options = open
    .map(function (task) {
      const selected = task.id === focusState.taskId ? "selected" : "";
      return `<option value="${task.id}" ${selected}>${escapeHtml(task.title)}</option>`;
    })
    .join("");

  focusTaskSelect.innerHTML = `<option value="">Nothing in particular</option>${options}`;
  focusTaskDone.hidden = !focusState.taskId;
}

// remember the chosen task
function handleFocusTaskChange() {
  focusState.taskId = focusTaskSelect.value ? Number(focusTaskSelect.value) : null;
  focusTaskDone.hidden = !focusState.taskId;
  saveFocus();
}

// complete the task being worked on
function completeFocusTask() {
  if (focusState.taskId) {
    completeTask(focusState.taskId);
  }
}

// hide the sidebar, header and footer around the timer
function setImmersive(on) {
  document.body.classList.toggle("immersive", on);
  immersiveBtn.setAttribute("aria-pressed", String(on));
  immersiveText.textContent = on ? "Show everything (Esc)" : "Hide distractions";
}

// browsers only allow sound after a click, so the audio starts on the first start
function unlockAudio() {
  // only create the audio inside a real click or key press
  const userActive = !navigator.userActivation || navigator.userActivation.isActive;
  if (!focusSettings.sound || !userActive) {
    return;
  }
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // nothing left to unlock once the audio is running
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch (error) {
    audioContext = null;
  }
}

// two soft notes made in the browser, no sound file needed
function playChime() {
  if (!focusSettings.sound || !audioContext) {
    return;
  }
  try {
    const now = audioContext.currentTime;
    [659.25, 880].forEach(function (frequency, index) {
      const start = now + index * 0.18;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 1.25);
    });
  } catch (error) {
    // sound is optional
  }
}

// timer listeners
function setupFocusListeners() {
  timerToggle.addEventListener("click", toggleTimer);
  timerReset.addEventListener("click", resetTimer);
  timerSkip.addEventListener("click", skipSession);

  modeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTimerMode(button.dataset.mode);
    });
  });

  focusTaskSelect.addEventListener("change", handleFocusTaskChange);
  focusTaskDone.addEventListener("click", completeFocusTask);

  immersiveBtn.addEventListener("click", function () {
    setImmersive(!document.body.classList.contains("immersive"));
  });

  [focusMinutesInput, shortMinutesInput, longMinutesInput].forEach(function (input) {
    input.addEventListener("change", handleDurationChange);
  });

  soundSwitch.addEventListener("click", function () {
    focusSettings.sound = !focusSettings.sound;
    syncFocusSettingControls();
    saveFocusSettings();
  });

  // get sound ready on the first click or key press, also after a reload
  document.addEventListener("pointerdown", unlockAudio);
  document.addEventListener("keydown", unlockAudio);

  // the timer keeps time even in a background tab, this catches up the display
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && focusState.status === "running") {
      if (getRemaining() === 0) {
        completeSession();
      } else {
        updateTimerDisplay();
      }
    }
  });
}

// views for the number keys
const shortcutViews = ["dashboard", "all", "today", "upcoming", "completed", "focus"];

// handle keyboard shortcuts
function handleShortcuts(event) {
  if (event.key === "Escape") {
    // leave distraction-free mode first
    if (document.body.classList.contains("immersive") && !taskModal.open && !confirmModal.open) {
      setImmersive(false);
      return;
    }
    // clear the search box first, then close the menu
    if (document.activeElement === searchInput && searchInput.value !== "") {
      searchInput.value = "";
      handleSearch();
      return;
    }
    closeSidebar();
    return;
  }

  // ignore shortcuts while typing, with modifier keys or when a dialog is open
  const target = event.target;
  const isTyping = target.closest("input, textarea, select, [contenteditable]");
  if (isTyping || event.ctrlKey || event.metaKey || event.altKey || taskModal.open || confirmModal.open) {
    return;
  }

  if (event.key === "n" || event.key === "N") {
    event.preventDefault();
    openTaskModal();
  } else if (event.key === "/") {
    event.preventDefault();
    searchInput.focus();
  } else if (/^[1-6]$/.test(event.key)) {
    setView(shortcutViews[Number(event.key) - 1]);
  } else if (currentView === "focus") {
    // timer keys, buttons keep their own space and enter behaviour
    if (event.key === " " && !target.closest("button")) {
      event.preventDefault();
      toggleTimer();
    } else if (event.key === "r" || event.key === "R") {
      resetTimer();
    } else if (event.key === "f" || event.key === "F") {
      setImmersive(!document.body.classList.contains("immersive"));
    }
  }
}

// start the app
function init() {
  loadTheme();
  loadTasks();
  loadFilters();
  syncFilterControls();
  showGreeting();
  showUserName();
  setupEventListeners();
  setupFocusListeners();
  loadFocus();
  renderApp();

  // refresh dates when the user comes back to the tab,
  // so "due today" and "overdue" stay correct after midnight
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      showGreeting();
      renderApp();
    }
  });
}

init();