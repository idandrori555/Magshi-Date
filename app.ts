import { getLessonStatus } from "./src/api.ts";

document.addEventListener("DOMContentLoaded", () => {
  initializeDefaultDate();
  attachFormHandler();
  fetchAndDisplayLesson(getTodayDate());
});

/**
 * Returns references to all necessary DOM elements.
 * @returns {Object} An object containing references to form, inputs, loaders, result containers, and error elements.
 */
function getDOMElements() {
  return {
    searchForm: document.getElementById("search-form") as HTMLFormElement,
    lessonDateInput: document.getElementById("lesson-date") as HTMLInputElement,
    loader: document.getElementById("loader") as HTMLDivElement,
    frontalLesson: document.getElementById("frontal-lesson") as HTMLDivElement,
    virtualLesson: document.getElementById("virtual-lesson") as HTMLDivElement,
    noLesson: document.getElementById("no-lesson") as HTMLDivElement,
    errorMessage: document.getElementById(
      "error-message"
    ) as HTMLParagraphElement,
    dateDisplays: {
      frontal: document.getElementById("frontal-date")!,
      virtual: document.getElementById("virtual-date")!,
      none: document.getElementById("no-lesson-date")!,
    },
  };
}

/**
 * Gets today's date in YYYY-MM-DD format.
 *
 * @returns {string} The current date as a string in ISO format.
 */
function getTodayDate(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Sets the date picker input to today's date.
 */
function initializeDefaultDate(): void {
  const { lessonDateInput } = getDOMElements();
  lessonDateInput.value = getTodayDate();
}

/**
 * Attaches an event listener to the form to handle submission.
 */
function attachFormHandler(): void {
  const { searchForm, lessonDateInput } = getDOMElements();

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedDate = lessonDateInput.value;
    if (!selectedDate) {
      displayError("נא לבחור תאריך");
      return;
    }
    fetchAndDisplayLesson(selectedDate);
  });
}

/**
 * Shows the loading spinner and hides all result or error messages.
 */
function showLoader(): void {
  const { loader, frontalLesson, virtualLesson, noLesson, errorMessage } =
    getDOMElements();
  loader.style.display = "block";
  frontalLesson.style.display = "none";
  virtualLesson.style.display = "none";
  noLesson.style.display = "none";
  errorMessage.style.display = "none";
}

/**
 * Displays an error message to the user and hides the loader.
 *
 * @param {string} message - The message to display in the error element.
 */
function displayError(message: string): void {
  const { loader, errorMessage } = getDOMElements();
  loader.style.display = "none";
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

/**
 * Converts a date string (YYYY-MM-DD) into a Date object.
 *
 * @param {string} dateStr - A string representing a date in YYYY-MM-DD format.
 * @returns {Date} A JavaScript Date object.
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Converts a Date object to a string formatted as DD/MM for API usage.
 *
 * @param {Date} date - A JavaScript Date object.
 * @returns {string} A string in DD/MM format.
 */
function formatDateForAPI(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/**
 * Converts a Date object to a Hebrew-friendly date string for UI display.
 *
 * @param {Date} date - A JavaScript Date object.
 * @returns {string} A formatted Hebrew date string.
 */
function formatHebrewDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ב${month}, ${year}`;
}

/**
 * Fetches lesson status from the API and updates the UI accordingly.
 *
 * @param {string} dateStr - A string representing the selected date (YYYY-MM-DD).
 */
function fetchAndDisplayLesson(dateStr: string): void {
  const { loader, dateDisplays, frontalLesson, virtualLesson, noLesson } =
    getDOMElements();

  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) {
    displayError("תאריך לא חוקי");
    return;
  }

  showLoader();

  const formattedForAPI = formatDateForAPI(date);
  const formattedDisplay = formatHebrewDate(date);

  getLessonStatus(formattedForAPI)
    .then((lessonType: string) => {
      loader.style.display = "none";

      dateDisplays.frontal.textContent = formattedDisplay;
      dateDisplays.virtual.textContent = formattedDisplay;
      dateDisplays.none.textContent = formattedDisplay;

      if (lessonType === "פרונטלי") {
        frontalLesson.style.display = "block";
      } else if (lessonType === "וירטואלי") {
        virtualLesson.style.display = "block";
      } else if (lessonType === "אין שיעור") {
        noLesson.style.display = "block";
      } else {
        throw new Error("Unexpected lesson type from API");
      }
    })
    .catch((error) => {
      console.error("API error:", error);
      displayError("אירעה שגיאה בעת טעינת נתוני השיעור. אנא נסה שוב.");
    });
}
