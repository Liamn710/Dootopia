import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
export const options = {
  headerShown: false,
};
const index = () => {
  return <Redirect href="/screens/HomeScreen" />;
};

export default index;

const styles = StyleSheet.create({});