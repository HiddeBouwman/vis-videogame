class HighscoreManager {
    getHighScores() {
        return JSON.parse(localStorage.getItem("highscores") || "[]");
    }
    addHighScore(score) {
        let highscores = this.getHighScores();
        highscores.push(score);
        highscores = highscores.sort((a, b) => b - a).slice(0, 5);
        localStorage.setItem("highscores", JSON.stringify(highscores));
    }
    getFastestTimes() {
        return JSON.parse(localStorage.getItem("fastesttimes") || "[]");
    }
    addFastestTime(ms) {
        let times = this.getFastestTimes();
        times.push(ms);
        times = times.filter(t => typeof t === "number" && !isNaN(t));
        times = times.sort((a, b) => a - b).slice(0, 5);
        localStorage.setItem("fastesttimes", JSON.stringify(times));
    }
    // geheim
    getLowestScores() {
        return JSON.parse(localStorage.getItem("lowestscores") || "[]");
    }
    addLowestScore(score) {
        let lowscores = this.getLowestScores();
        lowscores.push(score);
        lowscores = lowscores.sort((a, b) => a - b).slice(0, 5);
        localStorage.setItem("lowestscores", JSON.stringify(lowscores));
    }
}
export const highscoreManager = new HighscoreManager();