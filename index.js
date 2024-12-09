const search = new URLSearchParams(window.location.search).get("s") || "";

document.getElementById("search-box").value = search;

const favicon = document.getElementById("favicon");
const resultName = document.getElementById("result-name");
const resultDesc = document.getElementById("result-desc");
const resultRarity = document.getElementById("result-rarity");
const resultIntro = document.getElementById("result-intro");
const resultImage = document.getElementById("result-image");
const resultLastseen = document.getElementById("result-lastseen");
const resultOccurances = document.getElementById("result-occurances");
const resultPattern = document.getElementById("result-pattern");
const resultPrediction = document.getElementById("result-prediction");

const rarityColors = {
    common: "b1b1b1",
    uncommon: "87e339",
    rare: "37d1ff",
    epic: "e95eff",
    legendary: "e98d4b",
};

if (search === "") {
    resultName.innerHTML = "Search for an item!";
    resultImage.src = "./assets/images/search.png";
} else {
    const search = new URLSearchParams(window.location.search).get("s") || "";

    document.getElementById("search-box").value = search;

    const resultName = document.getElementById("result-name");
    const resultDesc = document.getElementById("result-desc");
    const resultRarity = document.getElementById("result-rarity");
    const resultIntro = document.getElementById("result-intro");
    const resultImage = document.getElementById("result-image");
    const resultLastseen = document.getElementById("result-lastseen");
    const resultOccurances = document.getElementById("result-occurances");
    const resultPattern = document.getElementById("result-pattern");
    const resultPrediction = document.getElementById("result-prediction");

    const rarityColors = {
        common: "b1b1b1",
        uncommon: "87e339",
        rare: "37d1ff",
        epic: "e95eff",
        legendary: "e98d4b",
    };

    if (search === "") {
        resultName.innerHTML = "Search for an item!";
        resultImage.src = "./assets/images/search.png";
    } else {
        fetch(
            `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(
                search
            )}&responseFlags=0x4`,
            {
                method: "GET",
                headers: { "User-Agent": "skibidi/toilet" },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 404) {
                    resultName.innerHTML = "No results found";
                    resultImage.src = "./assets/images/warning.png";
                    return;
                } else if (data.status !== 200) {
                    resultName.innerHTML = "An error occurred";
                    resultImage.src = "./assets/images/warning.png";
                    return;
                }

                const item = data.data;

                resultName.innerHTML = item.name;
                resultDesc.innerHTML = item.description;
                resultRarity.innerHTML = `<span style="color: #${
                    item.series?.colors
                        ? item.series.colors[0]
                        : rarityColors[item.rarity.value.toLowerCase()]
                }">${item.rarity.displayValue}</span> ${
                    item.type.displayValue
                }`;
                resultIntro.innerHTML = item.introduction.text;
                resultImage.src = item.images.icon;
                favicon.href = item.images.icon;

                // If there is no shop history, display appropriate message
                if (!item.shopHistory || item.shopHistory.length === 0) {
                    resultLastseen.innerHTML =
                        "This item is not available in the item shop";
                    resultOccurances.innerHTML = "Total occurrences: 0";
                    resultPrediction.innerHTML = "";
                    resultPattern.innerHTML = "";
                    return;
                }

                // Convert the shop history dates to Date objects
                const dates = item.shopHistory.map(
                    (dateStr) => new Date(dateStr)
                );

                // Check for invalid dates
                if (dates.some((date) => isNaN(date))) {
                    console.error(
                        "Invalid dates in shopHistory:",
                        item.shopHistory
                    );
                    return;
                }

                // Sort the dates in chronological order (earliest to latest)
                dates.sort((a, b) => a - b); // Sort by date value

                console.log("Sorted Dates:", dates);

                // Calculate intervals between dates (in days)
                const intervals = [];
                for (let i = 1; i < dates.length; i++) {
                    const diff =
                        (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
                    if (isNaN(diff)) {
                        console.error(
                            `Invalid interval at index ${i}: ${
                                dates[i - 1]
                            } - ${dates[i]}`
                        );
                    } else {
                        intervals.push(diff);
                    }
                }

                console.log("Intervals:", intervals);

                // If there are invalid intervals, return early
                if (intervals.some((interval) => isNaN(interval))) {
                    console.error("One or more intervals are invalid.");
                    return;
                }

                // Detect repeating patterns
                function detectPattern(intervals) {
                    for (
                        let length = 2;
                        length <= Math.floor(intervals.length / 2);
                        length++
                    ) {
                        const pattern = intervals.slice(0, length);
                        let isRepeating = true;

                        for (let i = 0; i < intervals.length; i++) {
                            if (intervals[i] !== pattern[i % length]) {
                                isRepeating = false;
                                break;
                            }
                        }

                        if (isRepeating) {
                            return pattern;
                        }
                    }
                    return null;
                }

                const pattern = detectPattern(intervals);
                if (pattern) {
                    console.log("Pattern detected:", pattern);
                    resultPattern.innerHTML = `Detected Pattern: ${pattern.join(
                        ", "
                    )} days`;
                } else {
                    console.log("No repeating pattern detected");
                    resultPattern.innerHTML = "No repeating pattern detected";
                }

                // Define the latest appearance date
                const latestAppearance = dates[dates.length - 1]; // Latest appearance is the most recent date in sorted dates

                // Calculate next interval and predicted appearance
                let nextInterval;
                if (pattern) {
                    const lastIndex = intervals.length % pattern.length;
                    nextInterval = pattern[lastIndex];
                } else {
                    const averageInterval =
                        intervals.reduce((sum, val) => sum + val, 0) /
                        intervals.length;
                    nextInterval = Math.round(averageInterval);
                }

                console.log("Next Interval:", nextInterval);

                // If nextInterval is invalid, return early
                if (isNaN(nextInterval)) {
                    console.error("Invalid nextInterval:", nextInterval);
                    resultPrediction.innerHTML =
                        "Error calculating next predicted appearance.";
                    return;
                }

                // Calculate next appearance date
                const nextAppearance = new Date(
                    latestAppearance.getTime() +
                        nextInterval * 24 * 60 * 60 * 1000
                );

                console.log("Next Appearance Date:", nextAppearance);

                // If next appearance date is far in the future (e.g., years), assume it might not return
                const yearsSinceLastSeen =
                    (new Date() - latestAppearance) /
                    (1000 * 60 * 60 * 24 * 365);
                if (yearsSinceLastSeen > 3) {
                    resultPrediction.innerHTML = `It might never come back. Last seen over ${Math.round(
                        yearsSinceLastSeen
                    )} years ago.`;
                    resultPattern.innerHTML = "";
                    resultLastseen.innerHTML = `Last seen: ${latestAppearance.toDateString()}`;
                    resultOccurances.innerHTML = `Total occurrences: ${item.shopHistory.length}`;
                    return;
                }

                // Check if the next appearance is valid
                if (isNaN(nextAppearance.getTime())) {
                    console.error("Invalid nextAppearance date");
                    resultPrediction.innerHTML =
                        "Error calculating next predicted appearance.";
                } else {
                    resultPrediction.innerHTML = `Next Predicted Appearance: ${nextAppearance.toDateString()}`;
                }

                // Display "Last Seen" and "Occurrences"
                resultLastseen.innerHTML = `Last seen: ${latestAppearance.toDateString()}`;
                resultOccurances.innerHTML = `Total occurrences: ${item.shopHistory.length}`;

                // Check if the item is in the shop today
                const todayUTC = new Date(
                    new Date().toISOString().split("T")[0] + "T00:00:00Z"
                );
                if (
                    latestAppearance.toISOString().split("T")[0] ===
                    todayUTC.toISOString().split("T")[0]
                ) {
                    resultPrediction.innerHTML =
                        "This item is currently in the item shop!";
                    resultPattern.innerHTML = "";
                }
            })
            .catch((err) => {
                console.error(err);
                resultName.innerHTML = "An error occurred";
                resultImage.src = "./assets/images/warning.png";
            });
    }
}
