import { getLessonStatus } from "./src/api.ts";

document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const searchForm = document.getElementById("search-form") as HTMLFormElement;
  const lessonDateInput = document.getElementById(
    "lesson-date"
  ) as HTMLInputElement;
  const loader = document.getElementById("loader") as HTMLDivElement;
  const frontalLesson = document.getElementById(
    "frontal-lesson"
  ) as HTMLDivElement;
  const virtualLesson = document.getElementById(
    "virtual-lesson"
  ) as HTMLDivElement;
  const noLesson = document.getElementById("no-lesson") as HTMLDivElement;
  const errorMessage = document.getElementById(
    "error-message"
  ) as HTMLParagraphElement;

  // Set today's date as default in DD/MM format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  lessonDateInput.value = `${day}/${month}`;

  // Add form submission event listener
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate date format (DD/MM)
    const dateValue = lessonDateInput.value;
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;

    if (!dateRegex.test(dateValue)) {
      errorMessage.textContent = "נא להזין תאריך בפורמט DD/MM";
      errorMessage.style.display = "block";
      return;
    }

    // Hide previous results and error
    frontalLesson.style.display = "none";
    virtualLesson.style.display = "none";
    noLesson.style.display = "none";
    errorMessage.style.display = "none";

    // Show loader
    loader.style.display = "block";

    // Parse the date components
    const [inputDay, inputMonth] = dateValue.split("/");
    const currentYear = new Date().getFullYear();

    // Create date object (use current year)
    const selectedDate = new Date(
      currentYear,
      parseInt(inputMonth) - 1,
      parseInt(inputDay)
    );

    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      loader.style.display = "none";
      errorMessage.textContent = "תאריך לא חוקי";
      errorMessage.style.display = "block";
      return;
    }

    // Format date for display
    const formattedDisplayDate = formatHebrewDate(selectedDate);

    try {
      const apiDate = `${inputDay}/${inputMonth}`; // Format date as DD/MM for API

      // Assume this function exists and will be implemented later
      getLessonStatus(apiDate)
        .then((lessonType: string) => {
          // Hide loader
          loader.style.display = "none";

          // Update all date displays
          document.getElementById("frontal-date")!.textContent =
            formattedDisplayDate;
          document.getElementById("virtual-date")!.textContent =
            formattedDisplayDate;
          document.getElementById("no-lesson-date")!.textContent =
            formattedDisplayDate;

          // Show the appropriate result card based on API response
          if (lessonType === "פרונטלי") {
            frontalLesson.style.display = "block";
          } else if (lessonType === "וירטואלי") {
            virtualLesson.style.display = "block";
          } else if (lessonType === "אין שיעור") {
            noLesson.style.display = "block";
          } else {
            // Handle unexpected response
            throw new Error("Unexpected lesson type from API");
          }
        })
        .catch((error) => {
          // Handle API errors
          console.error("API error:", error);
          loader.style.display = "none";
          errorMessage.textContent =
            "אירעה שגיאה בעת טעינת נתוני השיעור. אנא נסה שוב.";
          errorMessage.style.display = "block";
        });
    } catch (error) {
      loader.style.display = "none";
      errorMessage.textContent =
        "אירעה שגיאה בעת טעינת נתוני השיעור. אנא נסה שוב.";
      errorMessage.style.display = "block";
    }
  });

  /**
   * Format date to Hebrew style (DD בחודש MMMM, YYYY)
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
});
