// storage keys
const TASKS_KEY = "HazFocus-tasks";
const FILTERS_KEY = "HazFocus-filters";
const THEME_KEY = "HazFocus-theme";

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

// dashboard elements
const dashboardSection = document.getElementById("dashboard-section");
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statOverdue = document.getElementById("stat-overdue");
const progressText = document.getElementById("progress-text");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const productivityMessage = document.getElementById("productivity-message");

// toolbar elements
const toolbar = document.getElementById("toolbar");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const filterCategory = document.getElementById("filter-category");
const filterDue = document.getElementById("filter-due");
const sortSelect = document.getElementById("sort-select");
const clearFiltersBtn = document.getElementById("clear-filters-btn");

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
  success: "fa-circle-check",
  delete: "fa-trash",
  error: "fa-circle-exclamation"
};

// show a toast message
function showToast(message, type) {
  const toastType = toastIcons[type] ? type : "success";
  const toast = document.createElement("div");
  toast.className = "toast toast-" + toastType;
  toast.innerHTML = `<i class="fa-solid ${toastIcons[toastType]}" aria-hidden="true"></i><span>${escapeHtml(message)}</span>`;
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
      createdAt: today
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
    createdAt: task.createdAt || getTodayString()
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
    themeIcon.className = "fa-solid fa-sun";
    themeBtn.setAttribute("aria-label", "switch to light theme");
    themeSwitch.classList.add("on");
    themeSwitch.setAttribute("aria-checked", "true");
  } else {
    themeIcon.className = "fa-solid fa-moon";
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
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
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

// build html for one task card
function createTaskCard(task, canDrag) {
  const isDone = task.status === "completed";
  let dueClass = "due-normal";
  let dueBadge = "";

  if (isOverdue(task)) {
    dueClass = "due-overdue";
    dueBadge = '<span class="badge badge-overdue">Overdue</span>';
  } else if (isDueToday(task)) {
    dueClass = "due-today";
    dueBadge = '<span class="badge badge-today">Due today</span>';
  } else if (isUpcoming(task)) {
    dueClass = "due-upcoming";
  }

  const description = task.description
    ? `<p class="task-desc">${escapeHtml(task.description)}</p>`
    : "";

  const completeAction = isDone ? "restore" : "complete";
  const completeIcon = isDone ? "fa-rotate-left" : "fa-check";
  const completeLabel = isDone ? "Restore task" : "Complete task";
  const completeText = isDone ? "<span>Restore</span>" : "";
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
      <div class="card-top">
        <span class="priority priority-${task.priority}">
          <span class="priority-dot"></span>${task.priority}
        </span>
        <span class="category-tag">${escapeHtml(task.category)}</span>
      </div>

      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      ${description}

      <div class="card-meta">
        <span class="due-date ${dueClass}">
          <i class="fa-regular fa-calendar" aria-hidden="true"></i>${formatDate(task.dueDate)}
        </span>
        ${dueBadge}
        <span class="status-badge status-${task.status}">${statusLabels[task.status]}</span>
      </div>

      <div class="card-footer">
        <div>
          <label class="visually-hidden" for="move-${task.id}">Move task to another column</label>
          <select class="move-select" id="move-${task.id}" data-id="${task.id}">
            ${moveOptions}
          </select>
        </div>
        <div class="card-actions">
          <button type="button" class="action-btn action-complete" data-action="${completeAction}" data-id="${task.id}" aria-label="${completeLabel}: ${escapeHtml(task.title)}">
            <i class="fa-solid ${completeIcon}" aria-hidden="true"></i>${completeText}
          </button>
          <button type="button" class="action-btn action-edit" data-action="edit" data-id="${task.id}" aria-label="Edit task: ${escapeHtml(task.title)}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
          </button>
          <button type="button" class="action-btn action-delete" data-action="delete" data-id="${task.id}" aria-label="Delete task: ${escapeHtml(task.title)}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
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
      listElement.innerHTML = '<p class="column-empty">No tasks here. Drag a task into this column.</p>';
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
  taskGrid.innerHTML = visibleTasks
    .map(function (task) {
      return createTaskCard(task, false);
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
  // settings page has no tasks
  if (currentView === "settings") {
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
  toolbar.hidden = currentView === "settings";
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
  document.title = title + " | HazFocus";
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

// get a short productivity message
function getProductivityMessage(total, pending, overdue, percent) {
  if (total === 0 || pending === 0) {
    return "You're all caught up.";
  }
  if (overdue > 0) {
    return "You have tasks that need attention.";
  }
  if (percent >= 50) {
    return "Great progress today.";
  }
  return "Stay focused and take one task at a time.";
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

  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statPending.textContent = pending;
  statOverdue.textContent = overdue;

  progressText.textContent = `${completed} of ${total} tasks completed`;
  progressPercent.textContent = percent + "%";
  progressFill.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", percent);
  productivityMessage.textContent = getProductivityMessage(total, pending, overdue, percent);
}

// update the whole page
function renderApp() {
  updateViewLayout();
  updateSidebar();
  updatePageTitle();
  updateStatistics();
  updateCounts();
  renderTasks();
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
    createdAt: getTodayString()
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
  task.status = data.status;

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
  task.status = newStatus;

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
    modalTitle.textContent = "Add new task";
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
    completeTask(id);
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

  // leave settings so results are visible
  if (currentView === "settings") {
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
  window.scrollTo(0, 0);
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

  // close the mobile menu with escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}

// start the app
function init() {
  loadTheme();
  loadTasks();
  loadFilters();
  syncFilterControls();
  showGreeting();
  setupEventListeners();
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