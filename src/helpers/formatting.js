function pad(input, length) {
    // Pad a number with zeros
    return (Array(length + 1).join('0') + input).slice(-length);
}

function toHex(value, zeroes=2) {
    return '0x' + pad(value.toString(16),zeroes).toUpperCase();
}

module.exports = { pad, toHex }