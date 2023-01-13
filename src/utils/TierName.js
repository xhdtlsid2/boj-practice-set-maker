const tierPrefix = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"];
const tierSuffix = ["", " Ⅴ", " Ⅳ", " Ⅲ", " Ⅱ", " Ⅰ"];

export function tierName(tierIndex){
    return tierPrefix[Math.floor(tierIndex / 6)] + tierSuffix[tierIndex % 6];
}

export function solvedacLevelToTierIndex(level){
    const optionIndex = Math.floor((level - 1) / 5);
    const subIndex = (level - 1) % 5 + 1;
    return optionIndex * 6 + subIndex;
}