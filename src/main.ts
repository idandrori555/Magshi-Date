import { getLessonStatus } from "./api.ts";

const LOADING_TEXT = "טוען...";

const button = document.querySelector("button");
const datePicker = document.getElementById("datePicker") as HTMLInputElement;

const output = document.getElementById("output");

const getTodaysDate = () =>
  new Date()
    .toLocaleDateString()
    .split(".")
    .slice(0, 2)
    .map((a) => a.padStart(2, "0"))
    .join("/");

window.onload = () => {
  datePicker.value = getTodaysDate();
};

button?.addEventListener("click", async () => {
  const date = datePicker.value;
  if (!date) return alert("Enter date");

  const paddedDate = date.split("/").map((a) => a.padStart(2, "0"));
  if (!paddedDate) return alert("error");

  if (!output) return alert("error");

  output.innerHTML = LOADING_TEXT;
  try {
    output.innerText = (await getLessonStatus(date)) ?? "error";
  } catch (err) {
    console.error(err);
    output.innerText = new String(err).toString();
  }
});
