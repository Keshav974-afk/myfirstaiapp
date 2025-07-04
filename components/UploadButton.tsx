import { StyleSheet, View, Pressable } from 'react-native';
import { Image as ImageIcon, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface UploadButtonProps {
  onUpload: (file: any) => void;
}

export function UploadButton({ onUpload }: UploadButtonProps) {
  const colorScheme = useColorScheme();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onUpload({
          uri: asset.uri,
          type: 'image',
          mimeType: 'image/jpeg',
          width: asset.width,
          height: asset.height,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        onUpload({
          uri: asset.uri,
          type: 'document',
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Error picking document. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}
        onPress={pickImage}
      >
        <ImageIcon size={20} color="#FFFFFF" />
      </Pressable>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}
        onPress={pickDocument}
      >
        <FileText size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});