import { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Pressable, 
  Modal, 
  FlatList,
  useColorScheme,
  TextInput
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import { Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
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

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const renderModelItem = ({ item }: { item: AIModel }) => {
    const isSelected = selectedModel?.id === item.id;
    
    return (
      <Pressable
        style={[
          styles.modelItem,
          isSelected && {
            backgroundColor: item.color
              ? `${item.color}20`
              : Colors[colorScheme ?? 'light'].tintTransparent,
          },
        ]}
        onPress={() => handleSelectModel(item)}
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
        style={[
          styles.selector,
          { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
        ]}
        onPress={handleOpenModal}
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
          size={16} 
          color={Colors[colorScheme ?? 'light'].textSecondary} 
        />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            setSearchQuery('');
          }}
        >
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={StyleSheet.absoluteFill}
          />
        </Pressable>
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' }
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
            keyboardShouldPersistTaps="handled"
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
    paddingVertical: 8,
    borderRadius: 16,
  },
  selectedModelText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  modelList: {
    padding: 16,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
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