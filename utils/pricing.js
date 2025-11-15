const TARIFFS = {
  DAY: {
    BASE_FARE: 7.50,        
    PRICE_PER_KM: 1.50,    
    START_HOUR: 6,          
    END_HOUR: 20,          
  },
  NIGHT: {
    BASE_FARE: 7.50,        
    PRICE_PER_KM: 2.00,     
    START_HOUR: 20,
    END_HOUR: 6,
  },
};

export const isDayTime = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  return currentHour >= TARIFFS.DAY.START_HOUR && currentHour < TARIFFS.DAY.END_HOUR;
};

/**
 * Get tariff based on day/night mode
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {Object} Tariff object with BASE_FARE and PRICE_PER_KM
 */
export const getTariff = (isDayMode = true) => {
  return isDayMode ? TARIFFS.DAY : TARIFFS.NIGHT;
};

/**
 * Calculate ride price based on distance and day/night mode
 * @param {number} distanceKm - Distance in kilometers
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {number} Total price in DH
 */
export const calculatePrice = (distanceKm, isDayMode = true) => {
  const tariff = getTariff(isDayMode);
  const price = tariff.BASE_FARE + (distanceKm * tariff.PRICE_PER_KM);
  return parseFloat(price.toFixed(2));
};

/**
 * Calculate price with formatted string
 * @param {number} distanceKm - Distance in kilometers
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {string} Formatted price like "25.50 DH"
 */
export const getFormattedPrice = (distanceKm, isDayMode = true) => {
  const price = calculatePrice(distanceKm, isDayMode);
  return `${price.toFixed(2)} DH`;
};

/**
 * Get price breakdown details
 * @param {number} distanceKm - Distance in kilometers
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {Object} Breakdown with baseFare, distancePrice, total
 */
export const getPriceBreakdown = (distanceKm, isDayMode = true) => {
  const tariff = getTariff(isDayMode);
  const distancePrice = distanceKm * tariff.PRICE_PER_KM;
  const total = tariff.BASE_FARE + distancePrice;
  
  return {
    baseFare: tariff.BASE_FARE.toFixed(2),
    distancePrice: distancePrice.toFixed(2),
    total: total.toFixed(2),
    tariffType: isDayMode ? 'Jour (6h-20h)' : 'Nuit (20h-6h)',
    perKm: tariff.PRICE_PER_KM.toFixed(2),
  };
};

/**
 * Calculate incremental price during ride (for real-time counter)
 * @param {number} currentDistanceKm - Current distance traveled
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {number} Current price
 */
export const calculateIncrementalPrice = (currentDistanceKm, isDayMode = true) => {
  return calculatePrice(currentDistanceKm, isDayMode);
};

/**
 * Get tariff info as human-readable string
 * @param {boolean} isDayMode - true for day tariff, false for night tariff
 * @returns {string} Tariff description
 */
export const getTariffDescription = (isDayMode = true) => {
  const tariff = getTariff(isDayMode);
  const type = isDayMode ? 'Jour (6h-20h)' : 'Nuit (20h-6h)';
  return `${type}: ${tariff.BASE_FARE} DH + ${tariff.PRICE_PER_KM} DH/km`;
};

/**
 * Compare day vs night price for same distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {Object} Comparison with dayPrice, nightPrice, difference
 */
export const compareDayNightPrices = (distanceKm) => {
  const dayPrice = calculatePrice(distanceKm, true);
  const nightPrice = calculatePrice(distanceKm, false);
  const difference = nightPrice - dayPrice;
  
  return {
    dayPrice: dayPrice.toFixed(2),
    nightPrice: nightPrice.toFixed(2),
    difference: difference.toFixed(2),
    percentageIncrease: ((difference / dayPrice) * 100).toFixed(1),
  };
};

/**
 * Get current active tariff based on real time
 * @returns {Object} Current tariff with type indicator
 */
export const getCurrentTariff = () => {
  const isDay = isDayTime();
  const tariff = getTariff(isDay);
  
  return {
    ...tariff,
    type: isDay ? 'day' : 'night',
    description: getTariffDescription(isDay),
  };
};

// Export tariffs for reference
export const CASABLANCA_TARIFFS = TARIFFS;