export const defaultSettings = {
    mode: "timer", // "timer" of "score"
    timer: 60,
    scoreGoal: 100,
    spawnSpeed: 1,
    scoreboardType: "score", // "score" of "time"
};

export let settings = { ...defaultSettings };

export function resetSettings() {
    Object.assign(settings, defaultSettings);
}