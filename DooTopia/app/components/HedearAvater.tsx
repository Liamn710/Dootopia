// src/components/MyComponent.js

import * as React from 'react';
import { Avatar } from 'react-native-paper';

const HeaderAvatar = () => (
  // Note the updated path to the image
  <Avatar.Image size={24} source={require('../../assets/images/react-logo.png')} />
);

export default HeaderAvatar;