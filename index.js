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
            }">${item.rarity.displayValue}</span> ${item.type.displayValue}`;
            resultIntro.innerHTML = item.introduction.text;
            resultImage.src = item.images.icon;

            if (!item.shopHistory || item.shopHistory.length === 0) {
                resultLastseen.innerHTML =
                    "This item is not available in the item shop";
                return;
            }

            const dates = item.shopHistory.map((dateStr) => new Date(dateStr));

            if (dates.some((date) => isNaN(date))) {
                resultLastseen.innerHTML = "Error parsing shop history dates";
                return;
            }

            const latestAppearance = dates[dates.length - 1];
            const todayUTC = new Date(
                new Date().toISOString().split("T")[0] + "T00:00:00Z"
            );

            resultLastseen.innerHTML = `Last seen: ${latestAppearance.toDateString()}`;
            resultOccurances.innerHTML = `Total occurrences: ${item.shopHistory.length}`;

            if (
                latestAppearance.toISOString().split("T")[0] ===
                todayUTC.toISOString().split("T")[0]
            ) {
                resultPrediction.innerHTML =
                    "This item is currently in the item shop!";
                resultPattern.innerHTML = "";
                return;
            }

            dates.sort((a, b) => b - a);

            const intervals = [];
            for (let i = 1; i < dates.length; i++) {
                const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
                intervals.push(diff);
            }

            const filteredIntervals = [];
            for (let i = 0; i < intervals.length; i++) {
                if (intervals[i] === 1 && intervals[i - 1] === 1) {
                    continue; // Skip consecutive 1s
                }
                filteredIntervals.push(intervals[i]);
            }

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

            const meaningfulIntervals = filteredIntervals.filter(
                (interval) => interval !== 1
            );

            const pattern = detectPattern(meaningfulIntervals);

            if (pattern) {
                resultPattern.innerHTML = `Detected Pattern: ${pattern.join(
                    ", "
                )} days`;
            } else {
                resultPattern.innerHTML = "No repeating pattern detected";
            }

            let nextInterval;
            if (pattern) {
                const lastIndex = meaningfulIntervals.length % pattern.length;
                nextInterval = pattern[lastIndex];
            } else {
                const averageInterval =
                    meaningfulIntervals.reduce((sum, val) => sum + val, 0) /
                    meaningfulIntervals.length;
                nextInterval = Math.round(averageInterval);
            }

            const nextAppearance = new Date(
                latestAppearance.getTime() + nextInterval * 24 * 60 * 60 * 1000
            );
            resultPrediction.innerHTML = `Next Predicted Appearance: ${nextAppearance.toDateString()}`;
        })
        .catch((err) => {
            console.error(err);
            resultName.innerHTML = "An error occurred";
            resultImage.src = "./assets/images/warning.png";
        });
}
