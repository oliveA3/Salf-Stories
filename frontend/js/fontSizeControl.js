"use strict";

// <-- Font-size control -->
const rangeInput = document.getElementById("size-range");
const rangeOutput = document.getElementById("rangeValue");
rangeOutput.textContent = rangeInput.value;

const story = document.getElementById("story-content");

rangeInput.addEventListener("input", function () {
    rangeOutput.textContent = this.value;

    story.style.fontSize = rangeInput.value + "px";
});