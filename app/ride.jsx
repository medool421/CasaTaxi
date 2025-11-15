import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import { StatusBar } from "expo-status-bar";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { taxis, CASA_LOCATIONS ,CASA_CENTER, generateRandomTaxis } from '../utils/casaLocations';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import MapLightStyle from "../assets/mapLightStyle.json"
import MapDarkStyle from "../assets/mapDarkStyle.json"
import useTaxiStore from '../store/taxiStore';


export default function MapScreen() {
  const [taxis, setTaxis] = useState([]);
  const [userPosition, setUserPosition] = useState(CASA_CENTER);
  const [mapRegion, setMapRegion] = useState(CASA_CENTER);
  const isDayMode = useTaxiStore((state) => state.isDayMode);


// Request location permission and get user position
  useEffect(() => {
    (async () => {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de votre localisation pour trouver les taxis près de vous.',
          [{ text: 'OK' }]
        );
        // Use default Casablanca center if permission denied
        setUserPosition({
          latitude: CASA_CENTER.latitude,
          longitude: CASA_CENTER.longitude,
        });
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserPosition(userCoords);

      setMapRegion({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  useEffect(() => {
    const availableTaxis = generateRandomTaxis(8);
    setTaxis(availableTaxis);
  }, []);

  const handleBookTaxi = () => {
    console.log('Réserver un taxi clicked!');
      router.push('/booking');
  };

  const map = useMemo(()=>
        <MapView
        customMapStyle={!isDayMode ?MapDarkStyle:MapLightStyle}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
          <Marker
            coordinate={userPosition}
            title="Ma position"
            pinColor="#298cddff"
          />
        

        {taxis.map((taxi) => (
          <Marker
            key={taxi.id}
            coordinate={{
              latitude: taxi.latitude,
              longitude: taxi.longitude,
            }}
            title={`Taxi ${taxi.driver.carNumber}`}
            description={`${taxi.driver.name} - ⭐ ${taxi.driver.rating}`}
            image={require('../assets/taxi-vect.png')}
            />
        ))}

        {CASA_LOCATIONS.map((location) => (
          <Marker
          
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={`${location.name}`}
            description={`${location.address} - ⭐ ${location.rating}`}
            image={require('../assets/markerdest.webp')}
             />
        ))}
      </MapView>,[taxis, userPosition, isDayMode])
  
  return (
    <View style={styles.container}>
    <StatusBar style="auto"  />
    <View style={styles.textSection}>
        <Text style={styles.text} >🚖 CASA Taxi 🚖</Text>
    </View>
 
    {map}

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
  textSection: {
    position: 'absolute',
    zIndex:33,
    justifyContent :'center',
    top: 100,
    marginHorizontal:136,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  bookButton: {
    backgroundColor: '#DC143C',
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


