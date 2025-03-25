import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import vendingMachines from './data/vendingMachines.json'; //import vending machine list
import * as Location from "expo-location";

export default function App() {
  const spinValue = new Animated.Value(0);

  type VendingMachine = {
    id: string;
    retailer: string;
    machineID: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  
  type VendingMachineWithDistance = VendingMachine & { distance: number };

  //spin animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000, //3 seconds for a full rotation
        useNativeDriver: true,
      })
    ).start();
  }, []);

  //convert spin value to rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const openAppleMaps = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  
    let location = await Location.getCurrentPositionAsync({});
    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;
  
    if (vendingMachines.length === 0) {
      alert("No vending machines found.");
      return;
    }
  
    // Haversine formula for distance calculation
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
  
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
  
    // Create a copy of vending machines to track visited locations
    let remainingMachines = [...vendingMachines];
    let route: { latitude: number; longitude: number; retailer: string; address: string; city: string }[] = [];
    
    // Find the first nearest machine (from user location)
    let currentLat = userLat;
    let currentLon = userLon;
  
    for (let i = 0; i < 5 && remainingMachines.length > 0; i++) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
  
      remainingMachines.forEach((machine, index) => {
        const distance = getDistance(currentLat, currentLon, machine.latitude, machine.longitude);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
  
      // Add the closest machine to the route
      let nearestMachine = remainingMachines.splice(nearestIndex, 1)[0];
      route.push({
        latitude: nearestMachine.latitude,
        longitude: nearestMachine.longitude,
        retailer: nearestMachine.retailer,
        address: nearestMachine.address,
        city: nearestMachine.city
      });
  
      // Update the current location to the nearest machine for the next iteration
      currentLat = nearestMachine.latitude;
      currentLon = nearestMachine.longitude;
    }
  
    if (route.length === 0) {
      alert("No route could be generated.");
      return;
    }
  
    // Generate Apple Maps URL with multiple stops
    let appleMapsUrl = `maps://?saddr=${userLat},${userLon}`;
    
    route.forEach((stop, index) => {
      appleMapsUrl += `&daddr=${encodeURIComponent(stop.retailer)},${encodeURIComponent(stop.address)},${encodeURIComponent(stop.city)}`;
    });
  
    Linking.openURL(appleMapsUrl);
  };
  
  
  
  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openAppleMaps}>
        {/* import pokeball png */}
        <Animated.Image source={require("./assets/pokeball.png")}
        // style pokeball png
         style={[styles.pokeball, { transform: [{ rotate: spin }] }]}/>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeball: {
    width: 100,
    height: 100,
  },
});

