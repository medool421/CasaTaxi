import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { CASA_LOCATIONS, getLocationById } from '../utils/casaLocations';
import { calculateDistanceBetweenLocations } from '../utils/haversine';
import { calculatePrice, getPriceBreakdown } from '../utils/pricing';
import useTaxiStore from '../store/taxiStore';

export default function BookingScreen() {
  // Get user position from store
  const userPosition = useTaxiStore((state) => state.userPosition);
  const isDayMode = useTaxiStore((state) => state.isDayMode);
  const setDayMode = useTaxiStore((state) => state.setDayMode);
  const startRide = useTaxiStore((state) => state.startRide);

  // Create user location option
  const userLocationOption = {
    id: 'user_position',
    name: '📍 Ma Position Actuelle',
    latitude: userPosition?.latitude || 33.5731,
    longitude: userPosition?.longitude || -7.5898,
    address: userPosition ? 'Votre position GPS' : 'Position non disponible',
    type: 'user'
  };

  // Default to user position if available, otherwise first location
  const [pickupId, setPickupId] = useState(
    userPosition ? 'user_position' : CASA_LOCATIONS[0].id
  );
  const [destinationId, setDestinationId] = useState(CASA_LOCATIONS[1].id);

  // Get selected locations - handle user_position specially
  const pickupLocation = pickupId === 'user_position' 
    ? userLocationOption 
    : getLocationById(pickupId);
  const destinationLocation = getLocationById(destinationId);

  // Calculate trip details
  const isSameLocation = pickupId === destinationId;
  const distance = !isSameLocation
    ? calculateDistanceBetweenLocations(pickupLocation, destinationLocation)
    : 0;
  const estimatedTime = !isSameLocation ? Math.ceil((distance / 30) * 60) : 0;
  const price = !isSameLocation ? calculatePrice(distance, isDayMode) : 0;
  const priceBreakdown = !isSameLocation
    ? getPriceBreakdown(distance, isDayMode)
    : null;

  const handleConfirm = () => {
    if (isSameLocation) {
      Alert.alert('Erreur', 'Le point de départ et la destination doivent être différents');
      return;
    }

    startRide({
      pickup: pickupLocation,
      destination: destinationLocation,
      distance: distance,
      estimatedPrice: price,
      estimatedTime: estimatedTime,
      isDayMode: isDayMode,
    });

    Alert.alert('Réservation confirmée!', 'Votre taxi arrive...');
    router.push('/ride');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚖 Réserver un Taxi</Text>
        <Text style={styles.subtitle}>Petit Taxi Rouge - Casablanca</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isDayMode && styles.toggleButtonActive]}
          onPress={() => setDayMode(true)}
        >
          <Text style={[styles.toggleText, isDayMode && styles.toggleTextActive]}>
            ☀️ Jour
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isDayMode && styles.toggleButtonActive]}
          onPress={() => setDayMode(false)}
        >
          <Text style={[styles.toggleText, !isDayMode && styles.toggleTextActive]}>
            🌙 Nuit
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📍 Point de Départ</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={pickupId}
            onValueChange={(value) => setPickupId(value)}
            style={styles.picker}
          >
            <Picker.Item label="📍 Ma Position Actuelle" value="user_position" />
            {CASA_LOCATIONS.map((location) => (
              <Picker.Item
                key={location.id}
                label={location.name}
                value={location.id}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.address}>{pickupLocation?.address || 'Adresse non disponible'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>🎯 Destination</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={destinationId}
            onValueChange={(value) => setDestinationId(value)}
            style={styles.picker}
          >
            {CASA_LOCATIONS.map((location) => (
              <Picker.Item
                key={location.id}
                label={location.name}
                value={location.id}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.address}>{destinationLocation?.address || 'Adresse non disponible'}</Text>
      </View>

      {isSameLocation && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Veuillez choisir une destination différente
          </Text>
        </View>
      )}

      {!isSameLocation && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>📊 Détails du Trajet</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{distance.toFixed(2)} km</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Temps estimé:</Text>
            <Text style={styles.detailValue}>{estimatedTime} min</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarif:</Text>
            <Text style={styles.detailValue}>{priceBreakdown.tariffType}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.priceBreakdown}>
            <Text style={styles.priceBreakdownText}>
              Prise en charge: {priceBreakdown.baseFare} DH
            </Text>
            <Text style={styles.priceBreakdownText}>
              Distance ({distance.toFixed(2)} km × {priceBreakdown.perKm} DH): {priceBreakdown.distancePrice} DH
            </Text>
          </View>

          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Prix Total:</Text>
            <Text style={styles.totalPrice}>{price.toFixed(2)} DH</Text>
          </View>
        </View>
      )}

      {!isSameLocation && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>✅ Confirmer la Réservation</Text>
        </TouchableOpacity>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#DC143C',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#DC143C',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  warningContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  priceBreakdown: {
    marginBottom: 15,
  },
  priceBreakdownText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#DC143C',
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  confirmButton: {
    margin: 20,
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacing: {
    height: 40,
  },
});