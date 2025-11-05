"use strict";

const storyCount = 9;
const storyList = document.getElementById("story-list");
const output = document.getElementById("story-content");
const stories = [];

const offcanvasElement = document.getElementById("offcanvasDarkNavbar");
const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);

for (let i = 1; i <= storyCount; i++) {
    const filePath = `stories/story${i}.docx`;

    fetch(filePath)
    .then((res) => res.arrayBuffer())
    .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
    .then((result) => {
        const html = result.value;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const firstLine = tempDiv.querySelector("p, h1, h2, h3, h4, h5, h6");
        const title = firstLine ? firstLine.textContent.trim() : `Story ${i}`;

        const index = stories.length;
        stories.push({ title, content: html });

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.className = "dropdown-item";
        a.textContent = title;
        a.dataset.index = index;
        li.appendChild(a);
        storyList.appendChild(li);
    })
    .catch((err) => {
        console.error(`Error loading ${filePath}`, err);
    });
}

storyList.addEventListener("click", function (e) {
    e.preventDefault();
    const link = e.target;
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

        output.classList.remove("fade-out");
    }, 500);
});
