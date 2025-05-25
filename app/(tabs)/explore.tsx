import { StyleSheet, View, Text, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Search, Sparkles, Zap, Brain, Globe as Globe2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CATEGORIES = [
  {
    title: 'Featured',
    icon: Sparkles,
    color: '#8B5CF6',
    items: [
      'Write a blog post',
      'Generate images',
      'Analyze data',
      'Code review',
    ]
  },
  {
    title: 'Popular',
    icon: Zap,
    color: '#F59E0B',
    items: [
      'Summarize text',
      'Translation',
      'Grammar check',
      'Math solutions',
    ]
  },
  {
    title: 'Learning',
    icon: Brain,
    color: '#10B981',
    items: [
      'Study notes',
      'Practice problems',
      'Concept explanations',
      'Quiz creation',
    ]
  },
  {
    title: 'Research',
    icon: Globe2,
    color: '#3B82F6',
    items: [
      'Literature review',
      'Data analysis',
      'Research planning',
      'Citation help',
    ]
  },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();

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
          Explore
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
          placeholder="Search prompts..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category, index) => (
          <Animated.View 
            key={index}
            entering={FadeInDown.delay(index * 100).springify()}
            style={styles.category}
          >
            <View style={styles.categoryHeader}>
              <category.icon 
                size={24} 
                color={category.color}
                strokeWidth={2.2}
              />
              <Text style={[
                styles.categoryTitle,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {category.title}
              </Text>
            </View>

            <View style={styles.itemsGrid}>
              {category.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={({ pressed }) => [
                    styles.itemCard,
                    { 
                      backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                      borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      ...(Platform.OS === 'ios' ? {
                        shadowColor: Colors[colorScheme ?? 'light'].cardShadow,
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                      } : {
                        elevation: 3,
                      }),
                    }
                  ]}
                  android_ripple={{
                    color: Colors[colorScheme ?? 'light'].ripple,
                    borderless: true,
                    foreground: true,
                  }}
                >
                  <Text style={[
                    styles.itemText,
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
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
    fontSize: Platform.select({ ios: 28, android: 24 }),
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  itemText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
  },
});