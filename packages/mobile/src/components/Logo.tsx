import { Image, StyleSheet, View } from 'react-native'

export function Logo({ size = 72 }: { size?: number }): React.JSX.Element {
  return (
    <View style={[styles.shadow, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Image source={require('../../assets/logo.png')} style={{ width: size, height: size }} />
    </View>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  }
})
