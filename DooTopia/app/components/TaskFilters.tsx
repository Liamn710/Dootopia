import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, Switch as PaperSwitch, Text } from 'react-native-paper';
import type { AssigneeOption } from './TaskModal';

export type TaskFiltersProps = {
  currentUserId: string;
  assigneeFilter: string;
  assigneeOptions: AssigneeOption[];
  onChangeAssignee: (value: string) => void;
  availableTagLabels: string[];
  selectedTagLabels: string[];
  onToggleTag: (label: string) => void;
  tagMatchAll: boolean;
  onToggleTagMatch: (value: boolean) => void;
};

const TaskFilters = ({
  currentUserId,
  assigneeFilter,
  assigneeOptions,
  onChangeAssignee,
  availableTagLabels,
  selectedTagLabels,
  onToggleTag,
  tagMatchAll,
  onToggleTagMatch,
}: TaskFiltersProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const assigneeLabel = useMemo(() => {
    if (assigneeFilter === 'ALL') return 'All';
    if (assigneeFilter === currentUserId) return 'You';
    return assigneeOptions.find(option => option.id === assigneeFilter)?.label ?? 'Unknown';
  }, [assigneeFilter, assigneeOptions, currentUserId]);

  return (
    <View style={styles.filtersRow}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.filterButton}
          >
            Assigned: {assigneeLabel}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            onChangeAssignee('ALL');
            setMenuVisible(false);
          }}
          title="All"
        />
        <Menu.Item
          onPress={() => {
            onChangeAssignee(currentUserId);
            setMenuVisible(false);
          }}
          title="You"
        />
        {assigneeOptions
          .filter(option => option.id !== currentUserId)
          .map(option => (
            <Menu.Item
              key={option.id}
              onPress={() => {
                onChangeAssignee(option.id);
                setMenuVisible(false);
              }}
              title={option.label}
            />
          ))}
      </Menu>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsFilterScroll}
        style={{ flex: 1 }}
      >
        {availableTagLabels.map(label => {
          const selected = selectedTagLabels.includes(label);
          return (
            <Chip
              key={label}
              selected={selected}
              onPress={() => onToggleTag(label)}
              style={[styles.tagFilterChip, selected && styles.tagFilterChipSelected]}
            >
              {label}
            </Chip>
          );
        })}
      </ScrollView>

      <View style={styles.matchToggle}>
        <Text style={styles.matchToggleLabel}>{tagMatchAll ? 'All' : 'Any'}</Text>
        <PaperSwitch value={tagMatchAll} onValueChange={onToggleTagMatch} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButton: {
    marginRight: 8,
    borderColor: '#9DBCC3',
  },
  tagsFilterScroll: {
    paddingVertical: 4,
  },
  tagFilterChip: {
    marginRight: 6,
    backgroundColor: '#EAF6F9',
  },
  tagFilterChipSelected: {
    backgroundColor: '#C7E6ED',
  },
  matchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  matchToggleLabel: {
    marginRight: 6,
    color: '#5A8A93',
  },
});

export default TaskFilters;
