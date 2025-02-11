import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';

interface SharedImageProps {
  id: string;
  uri?: string | null;
  style?: any;
  placeholder?: React.ReactNode;
}

export const SharedImage = ({ id, uri, style, placeholder }: SharedImageProps) => {
  return (
    <SharedElement id={id}>
      {uri ? (
        <Image source={{ uri }} style={style} />
      ) : (
        <View style={style}>
          {placeholder}
        </View>
      )}
    </SharedElement>
  );
}; 