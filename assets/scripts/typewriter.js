const element = document.getElementById("welcome-message");
const text = element.getAttribute("text");
const textLength = text.length;
var textIndex = 0;

const delay = 100;

function updateText() {
    element.innerHTML = `<h1>${text.substr(0, textIndex)}</h1>`
    textIndex += 1

    if(textIndex == text.length+1) {
        clearInterval(updateInterval)
    }
}

const updateInterval = setInterval(updateText, delay)
