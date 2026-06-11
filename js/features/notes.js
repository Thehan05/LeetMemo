import {
    getStoredValues,
    setStoredValues
} from "../services/storage.js";
import { timeAgo } from "../utils/format.js";

export function initNotes(elements) {
    const {
        recentListView,
        noteEditor,
        noteTitle,
        noteBackButton,
        notesInput,
        notesStatus,
        saveNotesButton,
        submissionsList
    } = elements;

    let editingSlug = null;

    async function openEditor(slug, title) {
        editingSlug = slug;
        noteTitle.textContent = title;

        const { notes = {} } = await getStoredValues("notes");
        notesInput.value = notes[slug] ?? "";
        notesStatus.textContent = "";

        recentListView.hidden = true;
        noteEditor.hidden = false;
        notesInput.focus();
    }

    function closeEditor() {
        editingSlug = null;
        notesStatus.textContent = "";

        noteEditor.hidden = true;
        recentListView.hidden = false;
    }

    saveNotesButton.addEventListener("click", async () => {
        const note = notesInput.value.trim();

        notesStatus.textContent = "";

        if (!editingSlug) {
            notesStatus.textContent = "Please select a problem.";
            return;
        }

        if (!note) {
            notesStatus.textContent = "Please enter some notes.";
            notesInput.focus();
            return;
        }

        const { notes = {} } = await getStoredValues("notes");
        notes[editingSlug] = note;
        await setStoredValues({ notes });

        notesStatus.textContent = "Note saved.";
        setTimeout(() => {
            notesStatus.textContent = "";
        }, 2000);
    });

    noteBackButton.addEventListener("click", closeEditor);

    function renderSubmissions(submissions) {
        submissionsList.innerHTML = "";

        if (submissions.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.textContent = "No recent accepted submissions";
            submissionsList.appendChild(emptyItem);
            return;
        }

        submissions.forEach(submission => {
            const item = document.createElement("li");
            item.textContent =
                `${submission.title} - ${timeAgo(submission.timestamp)}`;
            item.title = submission.title;
            item.dataset.slug = submission.titleSlug;

            item.addEventListener("click", () => {
                openEditor(submission.titleSlug, submission.title);
            });

            submissionsList.appendChild(item);
        });

    }

    return { renderSubmissions };
}
