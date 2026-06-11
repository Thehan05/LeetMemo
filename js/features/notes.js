import {
    getStoredValues,
    setStoredValues
} from "../services/storage.js";
import { timeAgo } from "../utils/format.js";

export function initNotes(elements) {
    const {
        problemSelect,
        notesInput,
        notesStatus,
        saveNotesButton,
        submissionsList
    } = elements;

    async function loadSelectedNote() {
        const problemSlug = problemSelect.value;

        if (!problemSlug) {
            notesInput.value = "";
            return;
        }

        const { notes = {} } = await getStoredValues("notes");
        notesInput.value = notes[problemSlug] ?? "";
    }

    saveNotesButton.addEventListener("click", async () => {
        const problemSlug = problemSelect.value;
        const note = notesInput.value.trim();

        notesStatus.textContent = "";

        if (!problemSlug) {
            notesStatus.textContent = "Please select a problem.";
            return;
        }

        if (!note) {
            notesStatus.textContent = "Please enter some notes.";
            notesInput.focus();
            return;
        }

        const { notes = {} } = await getStoredValues("notes");
        notes[problemSlug] = note;
        await setStoredValues({ notes });

        notesStatus.textContent = "Note saved.";
        setTimeout(() => {
            notesStatus.textContent = "";
        }, 2000);
    });

    problemSelect.addEventListener("change", loadSelectedNote);

    function renderSubmissions(submissions) {
        submissionsList.innerHTML = "";
        problemSelect.innerHTML = "";

        if (submissions.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = "No recent accepted submissions";
            submissionsList.appendChild(emptyItem);

            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No recent problems";
            option.disabled = true;
            option.selected = true;
            problemSelect.appendChild(option);
            notesInput.value = "";
            return;
        }

        submissions.forEach(submission => {
            const item = document.createElement("li");
            item.textContent =
                `${submission.title} - ${timeAgo(submission.timestamp)}`;
            item.title = submission.title;
            submissionsList.appendChild(item);

            const option = document.createElement("option");
            option.value = submission.titleSlug;
            option.textContent = submission.title;
            problemSelect.appendChild(option);
        });

        loadSelectedNote();
    }

    return { renderSubmissions };
}
