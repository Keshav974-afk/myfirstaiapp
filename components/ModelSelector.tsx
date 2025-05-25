import { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  Modal, 
  FlatList,
  useColorScheme,
  TextInput,
  Platform,
  StatusBar
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp,
  SlideOutDown
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { AVAILABLE_MODELS } from '@/constants/Models';
import { AIModel } from '@/types/app';

export function ModelSelector() {
  const colorScheme = useColorScheme();
  const { selectedModel, setSelectedModel } = useAppSettings();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return AVAILABLE_MODELS;
    
    const query = searchQuery.toLowerCase();
    return AVAILABLE_MODELS.filter(model => 
      model.name.toLowerCase().includes(query) || 
      model.id.toLowerCase().includes(query) ||
      (model.description?.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderModelItem = ({ item }: { item: AIModel }) => {
    const isSelected = selectedModel?.id === item.id;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.modelItem,
          isSelected && {
            backgroundColor: item.color
              ? `${item.color}15`
              : Colors[colorScheme ?? 'light'].tintTransparent,
          },
          Platform.OS === 'android' && {
            elevation: pressed ? 0 : 1,
            backgroundColor: pressed 
              ? Colors[colorScheme ?? 'light'].ripple
              : Colors[colorScheme ?? 'light'].cardBackground,
          }
        ]}
        onPress={() => handleSelectModel(item)}
        android_ripple={{
          color: Colors[colorScheme ?? 'light'].ripple,
          borderless: true,
          foreground: true,
        }}
      >
        <View style={[
          styles.modelDot,
          { backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint }
        ]} />
        <View style={styles.modelInfo}>
          <Text style={[
            styles.modelName,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={[
              styles.modelDescription,
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              {item.description}
            </Text>
          ) : null}
          <Text style={[
            styles.modelId,
            { color: Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            {item.id}
          </Text>
        </View>
        {isSelected && (
          <View style={[
            styles.selectedIndicator,
            { backgroundColor: item.color || Colors[colorScheme ?? 'light'].tint }
          ]}>
            <Text style={styles.selectedText}>Using</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View>
      <Pressable 
        style={({ pressed }) => [
          styles.selector,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].border,
          },
          Platform.OS === 'android' && {
            elevation: pressed ? 0 : 2,
            backgroundColor: pressed 
              ? Colors[colorScheme ?? 'light'].ripple
              : Colors[colorScheme ?? 'light'].cardBackground,
          }
        ]}
        onPress={() => setModalVisible(true)}
        android_ripple={{
          color: Colors[colorScheme ?? 'light'].ripple,
          borderless: true,
          foreground: true,
        }}
      >
        <View style={[
          styles.modelDot,
          { backgroundColor: selectedModel?.color || Colors[colorScheme ?? 'light'].tint }
        ]} />
        <Text style={[
          styles.selectedModelText,
          { color: Colors[colorScheme ?? 'light'].text }
        ]}>
          {selectedModel?.name || 'Select Model'}
        </Text>
        <ChevronDown 
          size={20} 
          color={Colors[colorScheme ?? 'light'].textSecondary}
          strokeWidth={2.5}
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" />
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.modalOverlay,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          ]}
        >
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setModalVisible(false);
              setSearchQuery('');
            }}
          />
        </Animated.View>
        
        <Animated.View
          entering={SlideInUp.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContent,
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderTopColor: Colors[colorScheme ?? 'light'].border,
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Choose AI Model
            </Text>
          </View>

          <View style={[
            styles.searchContainer,
            { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
          ]}>
            <Search 
              size={20} 
              color={Colors[colorScheme ?? 'light'].textSecondary}
              strokeWidth={2.2}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}
              placeholder="Search models..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          
          <FlatList
            data={filteredModels}
            renderItem={renderModelItem}
            keyExtractor={(item) => item.id}
            style={styles.modelList}
            contentContainerStyle={styles.modelListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[
                  styles.emptyStateText,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  No models found matching "{searchQuery}"
                </Text>
              </View>
            }
          />
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    borderRadius: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    overflow: 'hidden',
  },
  selectedModelText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '80%',
    borderTopWidth: 1,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    } : {
      elevation: 24,
    }),
  },
  modalHeader: {
    padding: 16,
  },
  modalTitle: {
    fontSize: Platform.select({ ios: 18, android: 20 }),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 4 }),
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: Platform.select({ ios: 0, android: 8 }),
  },
  modelList: {
    flex: 1,
  },
  modelListContent: {
    padding: 16,
    paddingTop: 8,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? {
      backgroundColor: Colors.light.cardBackground,
      borderWidth: 1,
      borderColor: Colors.light.cardBorder,
    } : {
      elevation: 2,
    }),
  },
  modelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modelName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  modelDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  modelId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    opacity: 0.7,
  },
  selectedIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});