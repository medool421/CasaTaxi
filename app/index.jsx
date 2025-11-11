import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { CASA_CENTER, USER_POSITION, generateRandomTaxis } from '../utils/casaLocations';

export default function MapScreen() {
  const [taxis, setTaxis] = useState([]);

  // Generate taxis when component mounts
  useEffect(() => {
    const availableTaxis = generateRandomTaxis(8);
    setTaxis(availableTaxis);
  }, []);

  const handleBookTaxi = () => {
    console.log('Réserver un taxi clicked!');
    // TODO: Navigate to booking screen
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={CASA_CENTER}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
         <Marker
          coordinate={USER_POSITION}
          title="Ma position"
          pinColor="#298cddff"
        />

        {/* Red Taxi Markers */}
        {taxis.map((taxi) => (
          <Marker
            key={taxi.id}
            coordinate={{
              latitude: taxi.latitude,
              longitude: taxi.longitude,
            }}
            title={`Taxi ${taxi.driver.carNumber}`}
            description={`${taxi.driver.name} - ⭐ ${taxi.driver.rating}`}
            image={require('../assets/taxi-vect.png')}          />
        ))}
      </MapView>

      {/* Book Taxi Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookTaxi}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>🚖 Réserver un Taxi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  bookButton: {
    backgroundColor: '#DC143C', // Red color for Casablanca petit taxi
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});