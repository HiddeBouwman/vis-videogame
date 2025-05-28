// Haal de top 5 highscores uit localStorage
export function getHighScores() {
    return JSON.parse(localStorage.getItem("highscores") || "[]");
}

// Voeg een nieuwe score toe en bewaar alleen de top 5
export function addHighScore(score) {
    let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");
    highscores.push(score);
    highscores = highscores.sort((a, b) => b - a).slice(0, 5);
    localStorage.setItem("highscores", JSON.stringify(highscores));
}

// Haal de top 5 snelste tijden uit localStorage
export function getFastestTimes() {
    return JSON.parse(localStorage.getItem("fastesttimes") || "[]");
}

// Voeg een nieuwe snelle tijd toe en bewaar alleen de top 5
export function addFastestTime(ms) {
    let times = JSON.parse(localStorage.getItem("fastesttimes") || "[]");
    times.push(ms);
    times = times.filter(t => typeof t === "number" && !isNaN(t));
    times = times.sort((a, b) => a - b).slice(0, 5);
    localStorage.setItem("fastesttimes", JSON.stringify(times));
}