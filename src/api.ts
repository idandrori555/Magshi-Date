import config from "./config.json";

const { spreadsheet_id: SPREADSHEET_ID } = config;

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
const NO_DATA_MESSAGE = "No data found in the spreadsheet";
const NO_LESSON_MESSAGE = "אין שיעור";
const ERROR_MESSAGE = "שגיאה";

/**
 * Gets the current date formatted as DD/MM.
 * @returns {string} The current date in the format DD/MM.
 */
const getFormattedDateToday = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  return `${day}/${month}`;
};

/**
 * Finds the index of a word in an array of strings.
 * @param {string} word - The word to search for.
 * @param {string[]} stringArray - The array of strings to search within.
 * @returns {number} The index of the word if found, or -1 if not found.
 */
function findWordIndex(word: string, stringArray: string[]): number {
  return stringArray.findIndex((item) => item.includes(word));
}

/**
 * Fetches lesson status from a Google Spreadsheet for a given date.
 *
 * The function retrieves data from a public Google Spreadsheet in CSV format,
 * searches for the specified date, and returns the lesson status associated with it.
 *
 * @param {string} [date=getFormattedDateToday()] - The date to search for in the format DD/MM. Defaults to today's date.
 * @returns {Promise<string>} A promise that resolves to the lesson status as a string.
 * Possible return values:
 * - The lesson status for the given date.
 * - "No data found in the spreadsheet" if the spreadsheet is empty or invalid.
 * - "אין שיעור" if no lesson is found for the given date.
 * - "שגיאה" if an error occurs while processing the data.
 * - A generic error message if an exception is thrown.
 */
export async function getLessonStatus(
  date: string = getFormattedDateToday()
): Promise<string> {
  try {
    const response = await fetch(CSV_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const csvData = await response.text();
    const rows = csvData.split("\n").map((row) => row.split(","));

    if (!rows || rows.length <= 1) {
      return NO_DATA_MESSAGE;
    }

    const matchingRow = rows.find((row) => row.toString().includes(date));

    if (matchingRow) {
      const dateIndex = findWordIndex(date, matchingRow);
      return (matchingRow[dateIndex + 1] ?? ERROR_MESSAGE).split('"').join("");
    }

    return NO_LESSON_MESSAGE;
  } catch (error) {
    console.error("Error fetching or processing the spreadsheet data:", error);
    return "An error occurred while processing the data.";
  }
}
