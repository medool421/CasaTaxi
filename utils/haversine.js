// utils/haversine.js

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert degrees to radians
  const toRadians = (degree) => degree * (Math.PI / 180);
  
  // Calculate differences
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Convert latitudes to radians
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance in kilometers
  const distance = R * c;
  
  return distance;
};

/**
 * Calculate distance and return formatted string
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {string} Distance formatted as "X.XX km"
 */
export const getFormattedDistance = (lat1, lon1, lat2, lon2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return `${distance.toFixed(2)} km`;
};

/**
 * Calculate estimated time based on distance
 * Assumes average speed of 30 km/h in Casablanca traffic
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Time in minutes
 */
export const calculateEstimatedTime = (distanceKm) => {
  const averageSpeed = 30; // km/h (Casablanca city traffic)
  const timeHours = distanceKm / averageSpeed;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  return timeMinutes;
};

/**
 * Get formatted time string
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time like "15 min" or "1h 20min"
 */
export const getFormattedTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Calculate distance between two location objects
 * @param {Object} location1 - First location with latitude/longitude
 * @param {Object} location2 - Second location with latitude/longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceBetweenLocations = (location1, location2) => {
  return calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );
};