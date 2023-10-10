"use strict";

let habits = [];

/* -------------------------------- vars --------------------------------------- */

const page = {
  menu: document.querySelector(".menu"),
  headerTitle: document.querySelector(".main-header_title"),
  progressPercent: document.querySelector(".progress-bar_value"),
  progressRange: document.getElementById("progress"),
  daysList: document.querySelector(".days-list"),
  deleteDayBtn: document.querySelector(".delete-day-btn"),
  addDaysForm: {
    titleDay: document.getElementById("label-input-day"),
    input: document.getElementById("input-add-day"),
    submitBtn: document.getElementById("btn-add-day"),
  },
  modal: {
    body: document.querySelector(".modal"),
    inputIcon: document.getElementById("modal-icon-input"),
    inputTitle: document.getElementById("modal-title-input"),
    submitBtn: document.getElementById("create-habit-btn"),
    form: document.getElementById("modal-form"),
  },
};

function loadData() {
  const localStorageData = window.localStorage.getItem("habits");
  const habitsArray = JSON.parse(localStorageData);
  if (Array.isArray(habitsArray)) {
    habits = habitsArray;
  }
}

function saveData() {
  const stringifyHabits = JSON.stringify(habits);
  window.localStorage.setItem("habits", stringifyHabits);
}

/* -------------------------------- re-render --------------------------------------- */

function rerenderMenu(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  for (const habit of habits) {
    const exist = document.querySelector(`[menu-id="${habit.id}"]`);
    if (!exist) {
      const newElem = document.createElement("button");
      newElem.setAttribute("menu-id", habit.id);
      newElem.classList.add("menu_item");
      newElem.addEventListener("click", () => {
        rerender(habit.id);
      });
      newElem.innerHTML = `<img src="./assets/${habit.icon}.svg" alt=${habit.name} />`;
      if (activeHabbit.id === habit.id) {
        newElem.classList.add("active-menu");
      }
      page.menu.appendChild(newElem);
      continue;
    }
    if (activeHabbit.id === habit.id) {
      exist.classList.add("active-menu");
    } else {
      exist.classList.remove("active-menu");
    }
  }
}

function rerenderHeader(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  const currentProgress = Math.round(
    (activeHabbit.days.length * 100) / activeHabbit.goal
  );
  page.headerTitle.innerText = activeHabbit.name;
  page.progressPercent.innerText =
    currentProgress >= 100 ? "100%" : `${currentProgress}%`;
  page.progressRange.value = currentProgress;
}

function rerenderHabitsDays(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  page.daysList.innerHTML = "";
  activeHabbit.days.forEach((item, idx) => {
    const itemDay = document.createElement("li");
    itemDay.classList.add("days-list_item");
    itemDay.innerHTML = `<span class="day_title">День ${idx + 1}</span>
    <span class="days-list_item_text">${item.comment}</span>
    <button class="delete-day-btn" onclick="removeDay(${idx})"> 
     <img
        class="delete-btn_icon"
        src="./assets/delete.svg"
        alt="delete"
     />
     </button>`;
    page.daysList.appendChild(itemDay);
  });

  page.addDaysForm.titleDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  const activeHabbit = habits.find((e) => e.id === activeHabbitId);
  rerenderMenu(activeHabbit);
  rerenderHeader(activeHabbit);
  rerenderHabitsDays(activeHabbit);
}

/* -------------------------------- form add days --------------------------------------- */

page.addDaysForm.input.addEventListener("input", (e) => {
  page.addDaysForm.submitBtn.disabled = !e.currentTarget.value;
});

function addDays(e) {
  e.preventDefault();
  const form = e.target;
  const habitId = +document
    .querySelector(".active-menu")
    .getAttribute("menu-id");
  const comment = new FormData(form).get("comment");
  habits[habitId - 1]?.days.push({ comment });
  saveData();
  rerender(habitId);
  form["comment"].value = "";
  page.addDaysForm.submitBtn.disabled = true;
}

/* -------------------------------- remove day --------------------------------------- */

function removeDay(idx) {
  const habitId = +document
    .querySelector(".active-menu")
    .getAttribute("menu-id");
  habits = habits.map((h) => {
    return h.id === habitId
      ? { ...h, days: h.days.filter((_, i) => i !== idx) }
      : h;
  });
  saveData();
  rerender(habitId);
}

/* -------------------------------- init app --------------------------------------- */

(() => {
  loadData();
  rerender(habits[0].id || 1);
})();

/* -------------------------------- Modal --------------------------------------- */

function setIcon(icoName, context) {
  page.modal.inputIcon.value = icoName;
  const activeIcon = document.querySelector(".modal_icon-item.active-icon");
  activeIcon.classList.remove("active-icon");
  context.classList.add("active-icon");
}

page.modal.inputTitle.addEventListener("input", (e) => {
  page.modal.submitBtn.disabled = !e.currentTarget.value;
});

function addHabit(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const icon = form.get("icon");
  const name = form.get("title");
  const goal = form.get("goal");
  const id =
    habits.reduce((maxValue, c) => (maxValue > c.id ? maxValue : c.id), 1) + 1;
  habits.push({ id, icon, name, goal, days: [] });
  rerender(id);
  saveData();
  toggleModal();
  page.modal.form.reset();
}

function toggleModal() {
  if (page.modal.body.style.display === "none") {
    page.modal.body.style.display = "block";
  } else {
    page.modal.body.style.display = "none";
  }
}
window.document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    page.modal.body.style = "none";
  }
});
