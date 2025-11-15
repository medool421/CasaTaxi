import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useTaxiStore = create(
  persist(
    (set, get) => ({
      // ========== USER & LOCATION ==========
      userPosition: null,
      pickupLocation: null,
      destinationLocation: null,

      setUserPosition: (position) => set({ userPosition: position }),
      setPickupLocation: (location) => set({ pickupLocation: location }),
      setDestinationLocation: (location) => set({ destinationLocation: location }),

      // ========== DAY/NIGHT MODE ==========
      isDayMode: true, // true = day (6h-20h), false = night (20h-6h)

      toggleDayNightMode: () => set({ isDayMode: !get().isDayMode }),
      setDayMode: (isDay) => set({ isDayMode: isDay }),

      // ========== CURRENT RIDE ==========
      currentRide: null, // Active ride data
      isRideActive: false,

      startRide: (rideData) =>
        set({
          currentRide: {
            ...rideData,
            startTime: new Date().toISOString(),
          },
          isRideActive: true,
        }),

      endRide: () => {
        const ride = get().currentRide;
        if (ride) {
          // Add to history when ride ends
          get().addRideToHistory({
            ...ride,
            endTime: new Date().toISOString(),
            finalPrice: ride.currentPrice || ride.estimatedPrice,
          });
        }
        set({
          currentRide: null,
          isRideActive: false,
        });
      },

      cancelRide: () =>
        set({
          currentRide: null,
          isRideActive: false,
        }),

      updateRidePrice: (newPrice) =>
        set({
          currentRide: {
            ...get().currentRide,
            currentPrice: newPrice,
          },
        }),

      updateRideDistance: (newDistance) =>
        set({
          currentRide: {
            ...get().currentRide,
            currentDistance: newDistance,
          },
        }),

      // ========== RIDE HISTORY (PERSISTED) ==========
      rideHistory: [],

      addRideToHistory: (ride) => {
        const newHistory = [
          ...get().rideHistory,
          {
            ...ride,
            id: `ride_${Date.now()}`,
            completedAt: new Date().toISOString(),
          },
        ];
        set({ rideHistory: newHistory });
      },

      deleteRideFromHistory: (rideId) => {
        const newHistory = get().rideHistory.filter(
          (ride) => ride.id !== rideId
        );
        set({ rideHistory: newHistory });
      },

      clearHistory: () => set({ rideHistory: [] }),

      // ========== STATISTICS ==========
      getStatistics: () => {
        const history = get().rideHistory;
        const totalRides = history.length;
        const totalSpent = history.reduce(
          (sum, ride) => sum + (ride.finalPrice || 0),
          0
        );
        const averagePrice = totalRides > 0 ? totalSpent / totalRides : 0;

        return {
          totalRides,
          totalSpent: totalSpent.toFixed(2),
          averagePrice: averagePrice.toFixed(2),
        };
      },

      // ========== AVAILABLE TAXIS ==========
      availableTaxis: [],

      setAvailableTaxis: (taxis) => set({ availableTaxis: taxis }),

      // ========== SELECTED TAXI ==========
      selectedTaxi: null,

      selectTaxi: (taxi) => set({ selectedTaxi: taxi }),
      deselectTaxi: () => set({ selectedTaxi: null }),

      // ========== RESET ALL (useful for debugging) ==========
      resetStore: () =>
        set({
          userPosition: null,
          pickupLocation: null,
          destinationLocation: null,
          isDayMode: true,
          currentRide: null,
          isRideActive: false,
          rideHistory: [],
          availableTaxis: [],
          selectedTaxi: null,
        }),
    }),
    {
      name: 'casataxi-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these keys (not currentRide or availableTaxis)
      partialize: (state) => ({
        rideHistory: state.rideHistory,
        isDayMode: state.isDayMode,
      }),
    }
  )
);

export default useTaxiStore;