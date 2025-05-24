import { StyleSheet, View, Image, Pressable, Text, Platform } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import * as WebBrowser from 'expo-web-browser';

interface ImagePreviewProps {
  imageUrl: string;
  onDownload?: () => void;
}

export function ImagePreview({ imageUrl, onDownload }: ImagePreviewProps) {
  const colorScheme = useColorScheme();

  const handleViewImage = async () => {
    if (Platform.OS === 'web') {
      window.open(imageUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(imageUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <Pressable
          style={[
            styles.viewButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={handleViewImage}
        >
          <ExternalLink size={16} color="#FFFFFF" />
          <Text style={styles.viewButtonText}>View Full Image</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  viewButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});