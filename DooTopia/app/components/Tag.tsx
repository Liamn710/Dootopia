import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Tag as TagItem } from '../types/Task';

type TagSelectorProps = {
  value?: TagItem[];
  onChange?: (tags: TagItem[]) => void;
  maxTags?: number;
  palette?: string[]; // optional custom palette
};

export default function TagSelector({
  value = [],
  onChange,
  maxTags = 10,
  palette = ['#4C6EF5', '#5A8A93', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#0EA5E9'],
}: TagSelectorProps) {
  const [tags, setTags] = useState<TagItem[]>(value);
  const [input, setInput] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(palette[0]);

  // Keep internal state in sync if parent-controlled value changes
  useEffect(() => {
    setTags(value ?? []);
  }, [value]);

  const addTag = () => {
    const label = input.trim();
    if (!label || tags.some(t => t.label === label) || tags.length >= maxTags) return;
    const next: TagItem = { label, color: selectedColor };
    const updated = [...tags, next];
    setTags(updated);
    onChange?.(updated);
    setInput('');
  };

  const removeTag = (label: string) => {
    const updated = tags.filter(t => t.label !== label);
    setTags(updated);
    onChange?.(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagsContainer}>
        {tags.map(tag => (
          <View key={tag.label} style={[styles.tag, { backgroundColor: tag.color || '#4C6EF5' }]}>
            <Text style={styles.tagText}>{tag.label}</Text>
            <TouchableOpacity onPress={() => removeTag(tag.label)}>
              <Text style={styles.remove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Color palette for next tag */}
      <View style={styles.paletteRow}>
        {palette.map(c => (
          <TouchableOpacity key={c} onPress={() => setSelectedColor(c)}>
            <View style={[styles.swatch, { backgroundColor: c, borderColor: selectedColor === c ? '#000' : 'transparent' }]} />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a tag..."
        value={input}
        onChangeText={setInput}
        onSubmitEditing={addTag}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, width: '100%', alignItems: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4C6EF5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 4,
  },
  tagText: { color: 'white' },
  remove: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
    width: '100%',
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 2,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    width: '100%',
    textAlign: 'center',
  },
});
