# HazFocus

A modern kanban-style task and productivity app built with plain HTML, CSS and JavaScript.

## Description

HazFocus helps you plan your work. You can create tasks, give them a category, priority and due date, and move them across a kanban board with drag and drop. The dashboard shows live statistics and a progress bar, and everything is saved in your browser with `localStorage`, so your tasks are still there after a refresh.

This project was built to practice core frontend skills without any framework or library.

**Live demo:** productivity-app-hazim.netlify.app

## Features

- **Task creation** with title, description, category, priority, due date and status
- **Editing** tasks in the same modal, with the data already filled in
- **Deleting** tasks with a custom confirmation modal
- **Completion** with one click, plus a restore option
- **Categories** (personal, study, work, coding, fitness) with live task counts
- **Priorities** (low, medium, high) with colour indicators
- **Due dates** with friendly formatting, plus due-today and overdue highlighting
- **Kanban board** with To do, In progress and Completed columns
- **Drag and drop** to move tasks between columns
- **Filtering** by status, priority, category and due date
- **Sorting** by newest, oldest, due date, priority or alphabetical order
- **Search** by title, description or category
- **Statistics** (total, completed, pending, overdue) and a progress bar
- **Views** for Dashboard, All tasks, Today, Upcoming and Completed
- **localStorage** for tasks, filters and theme
- Light and dark theme, toast notifications, empty states and responsive design

## Technologies

- HTML5
- CSS3 (custom properties, grid, flexbox, media queries)
- JavaScript (vanilla, ES6)
- localStorage
- Google Fonts (Inter) and Font Awesome icons

## JavaScript concepts demonstrated

- **DOM manipulation:** building cards with template literals and updating the page
- **Arrays and objects:** tasks are objects stored in an array
- **Array methods:** `map`, `filter`, `find`, `reduce`, `sort`
- **Event listeners:** clicks, input, change, submit and keyboard events, including event delegation
- **Drag and drop:** the HTML drag and drop events (`dragstart`, `dragover`, `drop`, `dragend`)
- **Date handling:** the `Date` object, friendly formatting, today, upcoming and overdue logic
- **localStorage:** saving and loading data with `JSON.stringify` and `JSON.parse`
- **Form validation:** custom error messages and `aria-invalid`

## Folder structure

```text
productivity-app/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    └── icons/
        └── favicon.svg
```

## Setup

1. Download or clone this repository.
2. Open the `productivity-app` folder in **VS Code**.
3. Install the **Live Server** extension if you do not have it yet.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The app opens in your browser at `http://127.0.0.1:5500`.

You can also open `index.html` directly in a browser. An internet connection is needed for the Google Fonts and Font Awesome icons.

## Notes

- Sample tasks appear only the first time you open the app. After that, your own saved tasks are used.
- Drag and drop works with a mouse. On touch screens, use the move dropdown on each task card.
- To reset everything, clear the site data in your browser or use **Settings**.

## Future improvements

- User authentication
- Firebase or a backend database
- Cloud synchronization
- Recurring tasks
- Reminders and notifications
- Calendar view
- Pomodoro timer
- Subtasks
- Team collaboration
- A React version of the project

## Author

Built by HAZIM AQIL

- GitHub: https://github.com/hazell-lab/
- Portfolio: https://hazimaqil-portfolio.netlify.app