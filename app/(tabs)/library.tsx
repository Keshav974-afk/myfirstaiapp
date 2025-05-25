import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { BookOpen, Star, Clock, Download } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const SECTIONS = [
  {
    title: 'Saved',
    icon: Star,
    items: [
      'Research Paper Analysis',
      'Marketing Strategy',
      'Code Review Guidelines',
      'Product Roadmap',
    ]
  },
  {
    title: 'Recent',
    icon: Clock,
    items: [
      'Data Analysis Report',
      'Blog Post Draft',
      'Meeting Summary',
      'Project Timeline',
    ]
  },
  {
    title: 'Downloads',
    icon: Download,
    items: [
      'Generated Images',
      'PDF Reports',
      'Code Snippets',
      'Presentation Slides',
    ]
  },
];

export default function LibraryScreen() {
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
          Library
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <section.icon 
                size={24} 
                color={Colors[colorScheme ?? 'light'].tint} 
              />
              <Text style={[
                styles.sectionTitle,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {section.title}
              </Text>
            </View>

            <View style={styles.itemsList}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={[
                    styles.itemCard,
                    { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground }
                  ]}
                >
                  <BookOpen 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                  <View style={styles.itemContent}>
                    <Text style={[
                      styles.itemTitle,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}>
                      {item}
                    </Text>
                    <Text style={[
                      styles.itemDate,
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    ]}>
                      Last modified: 2 days ago
                    </Text>
                  </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  itemContent: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});