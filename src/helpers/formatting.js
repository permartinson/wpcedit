function pad(input, length) {
    // Pad a number with zeros
    return (Array(length + 1).join('0') + input).slice(-length);
}

function toHex(value, zeroes=2) {
    return '0x' + pad(value.toString(16),zeroes).toUpperCase();
}

// A sprite's name for screen readers: "Sprite 0x41 (A), table 3". Fonts
// use ASCII codes, so the printable ones are shown as the character too.
function spriteName(index, tableIndex) {
    const character = index > 0x20 && index < 0x7f ? ` (${String.fromCharCode(index)})` : '';
    return `Sprite ${toHex(index)}${character}, table ${tableIndex}`;
}

export { pad, toHex, spriteName }