"use strict";

const storyList = document.getElementById("story-list");
const output = document.getElementById("story-content");
const stories = [];

const offcanvasElement = document.getElementById("offcanvasDarkNavbar");
const offcanvasInstance =
    bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);

// <-- LOADING STORIES -->
fetch("/stories_list")
    .then((res) => res.json())
    .then((files) => {
        files.forEach((file, index) => {
            fetch(file.url)
                .then((res) => res.arrayBuffer())
                .then((buffer) =>
                    mammoth
                        .convertToHtml({ arrayBuffer: buffer })
                        .then((result) => {
                            const html = result.value;
                            stories[index] = { content: html };

                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = html;

                            const firstLine =
                                tempDiv.querySelector("p, h1, h2, h3");
                            const title = firstLine
                                ? firstLine.textContent.trim()
                                : file.name;

                            const li = document.createElement("li");
                            const a = document.createElement("a");
                            a.href = "#";
                            a.className = "dropdown-item";
                            a.textContent = title;
                            li.dataset.index = index;
                            li.appendChild(a);
                            storyList.appendChild(li);
                        })
                );
        });
    });

// <-- DRAG AND DROP -->
storyList.querySelectorAll("li").forEach((li) => {
    li.draggable = true;

    li.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", li.dataset.index);
    });

    li.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    li.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData("text/plain");
        const toIndex = li.dataset.index;

        const items = [...storyList.children];
        storyList.insertBefore(items[fromIndex], items[toIndex]);
    });
});

function saveOrder() {
    const order = [...storyList.children].map((li) => li.textContent);

    fetch("/save_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
    })
        .then((res) => res.json())
        .then((data) => alert(data.mensaje));
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
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        output.classList.remove("fade-out");
    }, 500);
});