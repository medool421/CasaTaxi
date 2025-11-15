export const CASA_LOCATIONS = [
    {
        id:1,
        name: "Aéroport Mohamed V",
        latitude: 33.3676,
        longitude: -7.5898,
        type: "airport",
        address: "Route de l'Aéroport, Nouacer",
        rating: (4 + Math.random()).toFixed(1),
        
      },
      {
        id: 2,
        name: "Gare Casa-Voyageurs",
        latitude: 33.5901,
        longitude: -7.6156,
        type: "station",
        address: "Boulevard Bahmad, Casablanca",
        rating: (4 + Math.random()).toFixed(1),
  },
  {
    id: 3,
    name: "Morocco Mall",
    latitude: 33.5490,
    longitude: -7.6692,
    type: "mall",
    rating: (4 + Math.random()).toFixed(1),    
    address: "Boulevard de la Corniche, Ain Diab"
  },
  {
    id: 4,
    name: "Twin Center",
    latitude: 33.5785,
    longitude: -7.6241,
    type: "business",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard Zerktouni, Casablanca"
  },
  {
    id: 5,
    name: "Marina de Casablanca",
    latitude: 33.6081,
    longitude: -7.6308,
    type: "marina",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard Sidi Abderrahmane"
  },
  {
    id: 6,
    name: "Mosquée Hassan II",
    latitude: 33.6084,
    longitude: -7.6329,
    type: "landmark",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard Sidi Mohammed Ben Abdallah"
  },
  {
    id: 7,
    name: "Quartier des Habous",
    latitude: 33.5842,
    longitude: -7.6037,
    type: "district",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard Victor Hugo"
  },
  {
    id: 8,
    name: "Ain Diab",
    latitude: 33.5647,
    longitude: -7.6692,
    type: "beach",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard de la Corniche"
  },
  {
    id: 9,
    name: "Boulevard Zerktouni",
    latitude: 33.5818,
    longitude: -7.6234,
    type: "commercial",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Boulevard Zerktouni, Maarif"
  },
  {
    id: 10,
    name: "Marché Central",
    latitude: 33.5896,
    longitude: -7.6180,
    type: "market",
        rating: (4 + Math.random()).toFixed(1),    

    address: "Rue Chaouia, Centre Ville"
  }
];

export const CASA_CENTER = {
    latitude: 33.5231,
    longitude: -7.5898,
    latitudeDelta: 0.07,    
    longitudeDelta: 0.07,   
};

export const USER_POSITION = CASA_CENTER;

export const getLocationByName = (name) => {
  return CASA_LOCATIONS.find(loc => loc.name === name);
};

export const getLocationById = (id) => {
  return CASA_LOCATIONS.find(loc => loc.id === id);
};

export const getAllLocationNames = () => {
  return CASA_LOCATIONS.map(loc => loc.name);
};

export const generateRandomTaxis = (count) => {
    const taxis = [];
    const baseLatitude = CASA_CENTER.latitude;
    const baseLongitude = CASA_CENTER.longitude;

    for(let i = 0; i < count ; i++) {
        taxis.push ({
            id: `taxi_${i+1}`,
            latitude: baseLatitude + (Math.random() - 0.5)* 0.1,
            longitude: baseLongitude + (Math.random()- 0.5) * 0.1,
            availble: true,
            driver: {
              name: `Chauffeur ${i+1}`,
              rating: (4 + Math.random()).toFixed(1),
              carNumber: `${Math.floor(10000 + Math.random() * 90000)}`

            }
        });
      }
      return taxis;
};