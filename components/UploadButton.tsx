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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onUpload(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.assets && result.assets.length > 0) {
        onUpload(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
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