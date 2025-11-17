import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import useTaxiStore from '../store/taxiStore';
import { calculateIncrementalPrice } from '../utils/pricing';

export default function RideScreen() {
  const currentRide = useTaxiStore((state) => state.currentRide);
  const endRide = useTaxiStore((state) => state.endRide);
  const cancelRide = useTaxiStore((state) => state.cancelRide);
  const updateRidePrice = useTaxiStore((state) => state.updateRidePrice);
  const updateRideDistance = useTaxiStore((state) => state.updateRideDistance);

  const [seconds, setSeconds] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(7.50);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [taxiPosition, setTaxiPosition] = useState(null);
  const [ridePhase, setRidePhase] = useState('going_to_pickup'); // or 'going_to_destination'

  const mapRef = useRef(null);

  // Generate random driver info
  const driver = {
    name: "Ayoub Ned",
    rating: (4 + Math.random()).toFixed(1),
    carNumber: `A-${Math.floor(10000 + Math.random() * 90000)}-20`,
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent('Ahmed Benali')}&background=DC143C&color=fff&size=128`,
  };

  // If no active ride, redirect
  useEffect(() => {
    if (!currentRide) {
      Alert.alert('Erreur', 'Aucune course active');
      router.replace('/');
      return;
    }
    // Start taxi at pickup location
    setTaxiPosition(currentRide.pickup);
  }, []);

  // Timer - counts up every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animate taxi movement
  useEffect(() => {
    if (!currentRide) return;

    const totalDuration = 45000; // 45 seconds
    const interval = 100; // Update every 100ms
    const steps = totalDuration / interval;
    let currentStep = 0;

    const animationTimer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      if (progress <= 0.3) {
        // Phase 1: Going to pickup (0-30%)
        setRidePhase('going_to_pickup');
        const phaseProgress = progress / 0.3;
        
        // Interpolate position towards pickup
        const lat = currentRide.pickup.latitude + 
          (Math.random() - 0.5) * 0.01 * (1 - phaseProgress);
        const lng = currentRide.pickup.longitude + 
          (Math.random() - 0.5) * 0.01 * (1 - phaseProgress);
        
        setTaxiPosition({ latitude: lat, longitude: lng });
      } else {
        // Phase 2: Going to destination (30-100%)
        setRidePhase('going_to_destination');
        const phaseProgress = (progress - 0.3) / 0.7;
        
        // Interpolate position from pickup to destination
        const lat = currentRide.pickup.latitude + 
          (currentRide.destination.latitude - currentRide.pickup.latitude) * phaseProgress;
        const lng = currentRide.pickup.longitude + 
          (currentRide.destination.longitude - currentRide.pickup.longitude) * phaseProgress;
        
        setTaxiPosition({ latitude: lat, longitude: lng });

        // Update distance and price
        const distanceCovered = currentRide.distance * phaseProgress;
        setCurrentDistance(distanceCovered);
        
        const newPrice = calculateIncrementalPrice(distanceCovered, currentRide.isDayMode);
        setCurrentPrice(newPrice);
        updateRidePrice(newPrice);
        updateRideDistance(distanceCovered);
      }

      // End ride after 45 seconds
      if (progress >= 1) {
        clearInterval(animationTimer);
        handleRideComplete();
      }
    }, interval);

    return () => clearInterval(animationTimer);
  }, [currentRide]);

  const handleRideComplete = () => {
    Alert.alert(
      'Course terminée! 🎉',
      `Merci d'avoir utilisé CasaTaxi!\n\nPrix final: ${currentPrice.toFixed(2)} DH`,
      [
        {
          text: 'OK',
          onPress: () => {
            endRide();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la course?',
      'Êtes-vous sûr de vouloir annuler cette course?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            cancelRide();
            router.replace('/');
          },
        },
      ]
    );
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (!currentRide) return null;

  const mapRegion = {
    latitude: (currentRide.pickup.latitude + currentRide.destination.latitude) / 2,
    longitude: (currentRide.pickup.longitude + currentRide.destination.longitude) / 2,
    latitudeDelta: Math.abs(currentRide.pickup.latitude - currentRide.destination.latitude) * 2 + 0.05,
    longitudeDelta: Math.abs(currentRide.pickup.longitude - currentRide.destination.longitude) * 2 + 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={currentRide.pickup}
          title="Départ"
          pinColor="blue"
        />

        {/* Destination Marker */}
        <Marker
          coordinate={currentRide.destination}
          title="Destination"
          pinColor="green"
        />

        {/* Animated Taxi Marker */}
        {taxiPosition && (
          <Marker
            coordinate={taxiPosition}
            title="Votre Taxi"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={require('../assets/taxi-vect.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          </Marker>
        )}

        {/* Route Line */}
        <Polyline
          coordinates={[currentRide.pickup, currentRide.destination]}
          strokeColor="#DC143C"
          strokeWidth={4}
        />
      </MapView>

      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>
          {ridePhase === 'going_to_pickup' 
            ? '🚕 Le taxi arrive...' 
            : '🛣️ En route vers la destination'}
        </Text>
      </View>

      {/* Driver Info Card */}
      <View style={styles.driverCard}>
        <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverDetails}>⭐ {driver.rating} • {driver.carNumber}</Text>
        </View>
      </View>

      {/* Price & Timer Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>⏱️ Temps</Text>
            <Text style={styles.infoValue}>{formatTime(seconds)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>💰 Prix</Text>
            <Text style={styles.priceValue}>{currentPrice.toFixed(2)} DH</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.tripDetails}>
          <Text style={styles.tripText}>
            📍 {currentRide.pickup.name}
          </Text>
          <Text style={styles.arrow}>↓</Text>
          <Text style={styles.tripText}>
            🎯 {currentRide.destination.name}
          </Text>
        </View>

        <View style={styles.distanceInfo}>
          <Text style={styles.distanceText}>
            Distance: {currentDistance.toFixed(2)} / {currentRide.distance.toFixed(2)} km
          </Text>
        </View>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelButtonText}>❌ Annuler la course</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statusBanner: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#DC143C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  tripDetails: {
    alignItems: 'center',
    marginBottom: 10,
  },
  tripText: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#DC143C',
    marginVertical: 5,
  },
  distanceInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  distanceText: {
    fontSize: 12,
    color: '#999',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC143C',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});