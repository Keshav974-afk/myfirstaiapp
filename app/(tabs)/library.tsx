import { StyleSheet, View, Text, ScrollView, Image, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Image as ImageIcon, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useChatService } from '@/hooks/useChatService';
import { format } from 'date-fns';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const { generatedImages } = useChatService();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[
        styles.header,
        { borderBottomColor: Colors[colorScheme ?? 'light'].border }
      ]}>
        <Text style={[
          styles.title,
          { color: Colors[colorScheme ?? 'light'].text }
        ]}>
          Generated Images
        </Text>
      </View>

      {generatedImages.length === 0 ? (
        <View style={styles.emptyState}>
          <ImageIcon 
            size={48} 
            color={Colors[colorScheme ?? 'light'].textSecondary} 
          />
          <Text style={[
            styles.emptyStateTitle,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            No Generated Images Yet
          </Text>
          <Text style={[
            styles.emptyStateText,
            { color: Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            Images generated from your chats will appear here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.imageGrid}>
            {generatedImages.map((image, index) => (
              <View 
                key={index}
                style={[
                  styles.imageCard,
                  { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
                ]}
              >
                <Image
                  source={{ uri: image.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageDate}>
                    {format(image.createdAt, 'MMM d, yyyy')}
                  </Text>
                  <Pressable
                    style={[
                      styles.viewButton,
                      { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                    ]}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        window.open(image.url, '_blank');
                      }
                    }}
                  >
                    <ExternalLink size={16} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View Full</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  imageCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    maxWidth: 300,
  },
});