import React from "react";
import { StyleSheet } from "react-native";
import BottomTabNavigation from "./components/BottomTabNavigation";
export const options = {
  headerShown: false,
};
const index = () => {
  return <BottomTabNavigation />;
};

export default index;

const styles = StyleSheet.create({});