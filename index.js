const itemName = "Pickaxe_ID_179_StarWand"

async function getItemShop() {
    try {
        const res = await fetch('https://fortnite-api.com/v2/cosmetics/br/'+itemName);

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching the item shop:', error);
        return null;
    }
}

async function checkForStarWand() {
    const shopData = await getItemShop();

    if (shopData.data.shopHistory) {
        let itemExists = false;

        const lastShopUpdate = new Date(shopData.data.shopHistory[shopData.data.shopHistory.length - 1]);
        const today = new Date();
        const diffTime = Math.abs(today - lastShopUpdate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log('Days since last shop update:', diffDays);

        // check if time since last shop update is today

        if (diffDays === 0) {
            itemExists = true;
        }
        
        const result = document.getElementById("result");
        const since = document.getElementById("since");
        
        if (itemExists) {
            result.innerHTML = "StarWand <span class='rainbow'>IS</span> in the item shop."
            confetti.start()
        }
        else {
            result.innerHTML = "StarWand <span class='rainbow'>IS NOT</span> in the item shop."
        }

        since.innerHTML = "Last seen: " + diffDays + " days ago."
    } else {
        console.error('Failed to retrieve shop data or the shop data format is unexpected.');
        return null;
    }
}

checkForStarWand()

