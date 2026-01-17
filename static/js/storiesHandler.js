"use strict";

const storyList = document.getElementById("story-list");
const output = document.getElementById("story-content");
const stories = [];

const offcanvasElement = document.getElementById("offcanvasDarkNavbar");
const offcanvasInstance =
    bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);

const editButton = document.getElementById("edit-button");

// <-- LOADING STORIES -->
async function loadStories() {
    try {
        const res = await fetch("/stories_list");
        const files = await res.json();

        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const res = await fetch(file.url);
            const buffer = await res.arrayBuffer();

            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            const html = result.value;

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            const firstLine = tempDiv.querySelector("p, h1, h2, h3");
            const title = firstLine ? firstLine.textContent.trim() : file.name;

            stories[index] = { content: html, title };

            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `stories/${title}.docx`;
            a.className = "dropdown-item";
            a.textContent = title;
            a.dataset.index = index;
            li.appendChild(a);
            storyList.appendChild(li);
        }
        enableDragAndDrop();
    } catch (err) {
        console.error("Error loading stories:", err);
    }
}

loadStories();

// <-- DRAG AND DROP -->
function enableDragAndDrop() {
    const storyList = document.getElementById("story-list");

    const draggableItems = [...storyList.querySelectorAll("li")].filter(
        (li) => {
            const a = li.querySelector("a");
            return a && a.href.endsWith(".docx");
        },
    );

    draggableItems.forEach((li) => {
        li.draggable = true;

        li.addEventListener("dragstart", (e) => {
            li.classList.add("dragging");
            e.dataTransfer.setData("text/plain", draggableItems.indexOf(li));
        });

        li.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = storyList.querySelector(".dragging");
            if (dragging && dragging !== li) {
                const draggingIndex = draggableItems.indexOf(dragging);
                const targetIndex = draggableItems.indexOf(li);
                if (draggingIndex < targetIndex) {
                    storyList.insertBefore(dragging, li.nextSibling);
                } else {
                    storyList.insertBefore(dragging, li);
                }
            }
        });

        li.addEventListener("drop", (e) => {
            e.preventDefault();
        });

        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            saveOrder();
        });
    });
}

function saveOrder() {
    const order = [...document.querySelectorAll("#story-list li")]
        .filter((li) => li.querySelector("a")?.href.endsWith(".docx"))
        .map((li) => li.querySelector("a").textContent.trim());

    fetch("/save_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
    })
        .then((res) => res.json())
        .then((data) => console.log(data.message || data.mensaje));
}

// <-- READING STORY -->
storyList.addEventListener("click", function (e) {
    e.preventDefault();
    const link = e.target.closest("a");
    if (!link) return;

    const file = link.dataset.file;
    const index = link.dataset.index;

    offcanvasInstance.hide();
    output.classList.add("fade-out");

    setTimeout(() => {
        if (file && file.endsWith(".pdf")) {
            window.open(file, "_blank");
        } else if (index !== undefined && stories[index]) {
            output.innerHTML = stories[index].content;

            const p = document.getElementById("word-count");
            const text = output.textContent || "";
            const wordCount = text
                .trim()
                .split(/\s+/)
                .filter((w) => w.length > 0).length;

            p.textContent = `Word count: ${wordCount}`;
            p.style.display = "inline-block";
        }

        editButton.dataset.index = index;
        editButton.style.display = "inline-block";
        output.classList.remove("fade-out");
    }, 500);
});

// <-- EDITTING STORY -->
editButton.addEventListener("click", () => {
    const index = editButton.dataset.index;
    const story = stories[index];

    if (!story || !story.title) {
        console.error("No story selected or title missing.");
        return;
    }

    const title = story.title;
    window.location.href = `/edit_story?title=${encodeURIComponent(title)}`;
});
