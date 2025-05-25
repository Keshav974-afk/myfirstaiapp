import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Search, Sparkles, Zap, Brain, Globe2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const CATEGORIES = [
  {
    title: 'Featured',
    icon: Sparkles,
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

      <ScrollView style={styles.content}>
        {CATEGORIES.map((category, index) => (
          <View key={index} style={styles.category}>
            <View style={styles.categoryHeader}>
              <category.icon 
                size={24} 
                color={Colors[colorScheme ?? 'light'].tint} 
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
                  style={[
                    styles.itemCard,
                    { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
                  ]}
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
          </View>
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});