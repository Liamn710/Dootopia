import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
export const options = {
  headerShown: false,
};
const index = () => {
  return <Redirect href="/screens/HomeScreen" />;
};

export default index;

const styles = StyleSheet.create({});