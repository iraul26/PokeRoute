import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import vendingMachines from './data/vendingMachines.json'; // Import vending machine list
import * as Location from "expo-location";
import MapView, { Marker, Region } from 'react-native-maps';
import * as Animatable from "react-native-animatable";

export default function App() {
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<VendingMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  type VendingMachine = {
    id: string;
    retailer: string;
    machineID: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  
  //fetch user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      });
    })();
  }, []);

  //method to open Apple Maps with navigation to the selected vending machine
  const openAppleMaps = () => {
    if (!selectedMachine) return;
    const appleMapsUrl = `maps://?daddr=${selectedMachine.latitude},${selectedMachine.longitude}`;
    Linking.openURL(appleMapsUrl);
  };

  //method to hide splash screen and show map
  const hideSplashScreen = () => {
    setIsLoading(false);
  };

  //if loading, show splash screen
  if(isLoading) {
    return (
      <View style={styles.splashContainer}>
        {/* title */}
        <Image source={require('./assets/pokeRoute.png')} style={styles.titleImage} resizeMode='contain'/>

        {/* Spinning Poké Ball */}
        <Animatable.Image
          animation="rotate"
          iterationCount="infinite"
          duration={3000}
          source={require('./assets/pokeball.png')}
          style={styles.pokeball}
        />

        {/* Clickable GIF */}
        <TouchableOpacity onPress={hideSplashScreen}>
          <Image
            source={{ uri: 'https://media.giphy.com/media/10LKovKon8DENq/giphy.gif' }}
            style={styles.gif}
          />
        </TouchableOpacity>
      </View>
    );
  }

  //if no splash screen, show the interactive map
  return (
    <View style={{ flex: 1 }}>
      {userLocation ? (
        <MapView
          style={{ flex: 1 }}
          region={userLocation}
          showsUserLocation={true}
        >
          {vendingMachines.map(machine => (
            <Marker
            key={machine.id}
            coordinate={{ latitude: machine.latitude, longitude: machine.longitude }}
            title={machine.retailer}
            description={machine.address}
            onPress={() => setSelectedMachine(machine)}
          >
            <Image
              source={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACMCAMAAADMf1JSAAAAM1BMVEXYaGDokHDI2OjIUEioICh4eIDw8PhASGiouMhIgMBgoNj4yIiQoLD///9YWHBwuPCY0PhI3fU2AAADpUlEQVR4nO3c63qbMAwGYObEQDbGdv9XuyqqIskcbEyCLcb3o8TgwNsqNk6ets1vkWHwFWQYpKkxA/S+aX5Vkqbx3hpwHPnwj4JhxThaAjKPuzbPbN/ueaZGItECkHiSlnsZTt4ZNBKI9QO9x4HdNLev7AXuKTE9HxzwGFxfk58BIOEIWDpkAZcFYNfdRPYVaH+JYSs9Xfe/ATkXMHdbeYkPAJaPdWD1JT45kHMBc7eVl/gAYPlYB1Zf4pMDORcwd1t5iQ8Alo91YPUlPjmQcwFzt5WX+ABg+VgHVl/ikwM5FzB3W3mJDwCWj3Vg9SU+OZBzAXO3lZf4o0C+QKkJhr9Bi0D8IVOHUiUmJhHtAOkQDZNyQGmxA5S7aMFwPBDCLzf02ABq3u12v5dZduGVNdEGUPOgW7mwAolWgO/hjSLvItoASl4ucBz7vhXp+1yktLxGceXAd/DambyDaAHovSTu4fUie4iS9/wNzOqBTEwnyRBO3rYIqXtuIwLPDhCJqbxwOPS9c00Q5/TEs6XkyLMFdK5LTBpvmZh6HRBZAratc/wnV133eCVsA7BXcY6mBfcdbuueAOQzISBs459dOde21oBIROQaEEk6xMFlBxRXgynw3BgQDMCzCEQknCQE6RLDpbwPL65LOw0+Q5c4BOM3TxY7QCowEWGA//nO4xG2ETgfmmiXewCQzgVTiXNhmxREtAOEySMXSCy8WUKJl6BpQJrgrQHxAIL4pRu254C0zNDgucGiBwkCdZt5loC8Sy/ZeQ+3vV8uss4cz/vlM4fXhunNBlATY/Eensgh8BwPQLJv30vgepBnB8gvzWlhdAA4BEEiv2XA4TGOYT8Axs5PvMm9uHqgnKi3AoEIiyQO7skFosQekCfqdWC4kMcAiQOYaZaWaRoob3TWgLRgXQtMFJIbe/soSTBJxZK0oq4aGJtAp8DHSqbA2A/AIrDrhkED6UM02ivbe4GxQcLAYXitZqoHQkMC4aMf+Eqd8aMgbB0FBJEdIOxEIh6GN9/wlTrjm/GlQfJzJblA0OAHcFaARMTDvOhElHx8BBAl1oB4gIG4536XYATKBVQKUPePA4lnDyiHir7l8fHPl5h5FoFpC6J9wC1ntwLUxFg+P0gkzwpQErcv+beVOL5glTwLQPjHfpK4Hfh3JblA4j3/c1n1QE2sAcg8K0BJjANln5Q37vLiKUDJswNkYspHGRq4duOaAlOuwDxLQCLGMn+69/XXPAPAf+F4PIy1ioKvAAAAAElFTkSuQmCC' }} //pokemon center marker
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      {/* Show Navigation Button when a vending machine is selected */}
      {selectedMachine && (
        <View style={styles.bottomPanel}>
          <Text style={styles.title}>{selectedMachine.retailer}</Text>
          <Text>{selectedMachine.address}, {selectedMachine.city}</Text>
          <TouchableOpacity style={styles.button} onPress={openAppleMaps}>
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    gap: 10
  },
  titleImage: {
    position: "absolute",
    top: 50,
    alignItems: "center"
  },
  pokeball: {
    width: 100,
    height: 100,
  },
  gif: {
    width: 350,
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

