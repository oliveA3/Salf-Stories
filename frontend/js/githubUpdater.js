"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("story-form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("title").value;
            const content = document.getElementById("content").value;

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);

            const response = await fetch("/new_story", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = "/";
            } else {
                alert("Hubo un error al subir la historia.");
                console.error(data);
            }
        });
    }
});
