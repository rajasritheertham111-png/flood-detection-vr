/**
 * Calculates flood risk and water depth dynamically.
 * @param {number} sensorFloodLevel - Current water level from IoT sensor (meters above sea level)
 * @param {number} groundElevation - Ground elevation at user location (meters above sea level)
 * @returns {object} { depth, isAlertTriggered, severity }
 */
export function calculateSubmergenceRisk(sensorFloodLevel, groundElevation) {
    const depth = sensorFloodLevel - groundElevation;

    let severity = 'NONE';
    if (depth > 2) severity = 'CRITICAL';
    else if (depth > 0.5) severity = 'HIGH';
    else if (depth > 0) severity = 'MODERATE';

    return {
        depth: Math.max(0, depth), // Ensure depth is never negative for visualization
        isAlertTriggered: depth > 0,
        severity
    };
}

/**
 * Normalizes Mapbox terrain-RGB array values to real-world altitude (meters)
 * Formula: altitude = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 */
export function getElevationFromRGB(r, g, b) {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
}
