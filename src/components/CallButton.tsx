import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function CallButton({
  title,
  subtitle,
  onPress,
  disabled
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0D5D8',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  title: { color: '#B51F32', fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#777777', fontSize: 13, marginTop: 5 }
});
