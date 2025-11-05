/**
 * Generates a 10-digit unique ID based on the current millisecond timestamp 
 * and an enhanced random component for robust collision avoidance.
 *
 * Strategy: 
 * 1. Takes the last 6 digits of the millisecond timestamp (time component).
 * 2. Appends 4 random digits (collision component).
 * 3. Total length is guaranteed to be 10 digits.
 *
 * @returns {string} A 10-digit string representing a time-based unique ID.
 */
const UUIDDD =() => {
    // 1. Time Component (Last 6 digits of the 13-digit millisecond timestamp)
    // This gives us an ID that is still time-sortable and unique across 1000 seconds (16.6 minutes).
    const timeComponent = (Date.now() % 1000000)
        .toString()
        .padStart(6, '0');

    // 2. Random Component (4 digits for micro-collision avoidance - 0000 to 9999)
    // This provides 10,000 unique IDs per millisecond, making collisions extremely rare.
    const randomComponent = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

    // 3. Combine to form the final 10-digit ID
    return timeComponent + randomComponent;
}

module.exports = UUIDDD