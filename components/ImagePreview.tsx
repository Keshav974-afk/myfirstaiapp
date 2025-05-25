import { StyleSheet, View, Image, Pressable, Text, Platform } from 'react-native';
import { ExternalLink, RefreshCw } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  onDownload?: () => void;
}

export function ImagePreview({ imageUrl, onDownload }: ImagePreviewProps) {
  const colorScheme = useColorScheme();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleViewImage = async () => {
    try {
      if (Platform.OS === 'web') {
        window.open(imageUrl, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(imageUrl);
      }
    } catch (error) {
      console.error('Error opening image:', error);
    }
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
    console.warn('Failed to load image:', imageUrl);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  if (error) {
    return (
      <View style={[
        styles.errorContainer,
        { backgroundColor: Colors[colorScheme ?? 'light'].dangerBackground }
      ]}>
        <Text style={[
          styles.errorText,
          { color: Colors[colorScheme ?? 'light'].danger }
        ]}>
          Failed to load image
        </Text>
        <Pressable
          style={[
            styles.retryButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].danger }
          ]}
          onPress={handleRetry}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        {loading && (
          <View style={[
            styles.loadingContainer,
            { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
          ]}>
            <Text style={[
              styles.loadingText,
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Loading image...
            </Text>
          </View>
        )}
        <Image 
          source={{ uri: imageUrl }} 
          style={[
            styles.image,
            loading && styles.hiddenImage
          ]}
          resizeMode="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
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
  hiddenImage: {
    opacity: 0,
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
  errorContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});