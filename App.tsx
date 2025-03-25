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

  //method to open Apple Maps with vending machine locations
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
  
    // Haversine formula to calculate the distance
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
  
    // Find the nearest vending machine
    let nearestMachine = vendingMachines.reduce<VendingMachineWithDistance>((nearest, currentMachine) => {
      const distance = getDistance(userLat, userLon, currentMachine.latitude, currentMachine.longitude);
      return distance < nearest.distance ? { ...currentMachine, distance } : nearest;
    }, { ...vendingMachines[0], distance: Infinity });
    
    
  
    if (!nearestMachine) {
      alert('No vending machines found.');
      return;
    }
  
    //Open Apple Maps with the route to the nearest vending machine
    const appleMapsUrl = `maps://?saddr=${userLat},${userLon}&daddr=${encodeURIComponent(nearestMachine.retailer)},${encodeURIComponent(nearestMachine.address)},${encodeURIComponent(nearestMachine.city)}`;
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

