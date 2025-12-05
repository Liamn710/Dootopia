import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Menu, Portal, Text, TouchableRipple } from 'react-native-paper';
import type { Tag as TagItem, Task } from '../types/Task';
import PointsSelector, { DEFAULT_POINT_OPTIONS } from './PointsSelector';
import TagSelector from './Tag';

export type EditableTaskValues = {
  title: string;
  text: string;
  points: number;
  dueDate?: string | null;
  tags: TagItem[];
  assignedToId?: string;
};

export type CreatableTaskValues = {
  title: string;
  text: string;
  points: number;
  dueDate?: string | null;
  tags: TagItem[];
  assignEmail?: string;
};

export type AssigneeOption = {
  id: string;
  label: string;
};

type BaseProps = {
  visible: boolean;
  onClose: () => void;
  isSaving?: boolean;
};

type EditProps = BaseProps & {
  mode: 'edit';
  task: Task;
  assigneeOptions?: AssigneeOption[];
  onSubmit: (values: EditableTaskValues) => Promise<void> | void;
};

type CreateProps = BaseProps & {
  mode: 'create';
  onSubmit: (values: CreatableTaskValues) => Promise<void> | void;
  initialValues?: Partial<CreatableTaskValues>;
};

type TaskModalProps = EditProps | CreateProps;

const toDateInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
};

const toTimeInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const combineToIso = (dateStr?: string, timeStr?: string) => {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hours || 0, minutes || 0, 0, 0));
  return date.toISOString();
};

const allowedPointValues = DEFAULT_POINT_OPTIONS.map(value => String(value));

const TaskModal = (props: TaskModalProps) => {
  const isEditMode = props.mode === 'edit';
  const task = isEditMode ? props.task : null;
  const initialCreateValues = !isEditMode ? props.initialValues : undefined;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [assignee, setAssignee] = useState<string | undefined>(undefined);
  const [assignEmail, setAssignEmail] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(120);
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);

  useEffect(() => {
    if (!props.visible) {
      return;
    }

    if (isEditMode && task) {
      setTitle(task.title ?? '');
      setDescription(task.text ?? '');
      const normalizedPoints = task.points != null ? String(task.points) : '';
      setPoints(allowedPointValues.includes(normalizedPoints) ? normalizedPoints : '');
      setTags(task.tags ?? []);
      setAssignee(task.assignedToId);
      setDateInput(toDateInput(task.dueDate));
      setTimeInput(toTimeInput(task.dueDate));
      setAssignEmail('');
    } else if (!isEditMode) {
      const initial = initialCreateValues ?? {};
      setTitle(initial.title ?? '');
      setDescription(initial.text ?? '');
      const normalizedPoints = initial.points != null ? String(initial.points) : '';
      setPoints(allowedPointValues.includes(normalizedPoints) ? normalizedPoints : '');
      setTags(initial.tags ?? []);
      setAssignee(undefined);
      setAssignEmail(initial.assignEmail ?? '');
      setDateInput(initial.dueDate ? toDateInput(initial.dueDate) : '');
      setTimeInput(initial.dueDate ? toTimeInput(initial.dueDate) : '');
    }
  }, [props.visible, isEditMode, task, initialCreateValues]);

  const assigneeOptions = isEditMode ? props.assigneeOptions ?? [] : [];

  const selectedAssigneeLabel = useMemo(() => {
    if (!isEditMode) return 'Unassigned';
    if (!assignee) return 'Unassigned';
    return assigneeOptions.find(option => option.id === assignee)?.label ?? 'Unassigned';
  }, [assignee, assigneeOptions, isEditMode]);

  const resetPickers = () => {
    setDateInput('');
    setTimeInput('');
  };

  const applyNativeDate = (selected?: Date) => {
    if (!selected) return;
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    setDateInput(`${yyyy}-${mm}-${dd}`);
  };

  const applyNativeTime = (selected?: Date) => {
    if (!selected) return;
    const hh = String(selected.getHours()).padStart(2, '0');
    const mm = String(selected.getMinutes()).padStart(2, '0');
    setTimeInput(`${hh}:${mm}`);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please provide a task title before saving.');
      return;
    }

    const parsedPoints = Number(points);
    if (Number.isNaN(parsedPoints) || parsedPoints <= 0) {
      Alert.alert('Invalid points', 'Please select a valid points value.');
      return;
    }

    const dueDateIso = dateInput ? combineToIso(dateInput, timeInput) : null;

    if (isEditMode) {
      (props as EditProps).onSubmit({
        title: title.trim(),
        text: description.trim(),
        points: parsedPoints,
        tags,
        assignedToId: assignee,
        dueDate: dueDateIso,
      });
    } else {
      (props as CreateProps).onSubmit({
        title: title.trim(),
        text: description.trim(),
        points: parsedPoints,
        tags,
        dueDate: dueDateIso,
        assignEmail: assignEmail.trim() || undefined,
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <Portal.Host>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <View style={styles.card}>
              <Text style={styles.title}>{isEditMode ? 'Edit Task' : 'Add Task'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.descriptionInput, { height: Math.max(120, descriptionHeight) }]}
                placeholder="Task description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onContentSizeChange={event => setDescriptionHeight(event.nativeEvent.contentSize.height)}
              />

              <PointsSelector value={points} onChange={setPoints} label="Points" />

              {isEditMode ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Assignee</Text>
                    {assignee && (
                      <Button compact mode="text" onPress={() => setAssignee(undefined)}>
                        Clear
                      </Button>
                    )}
                  </View>
                  <Menu
                    visible={assigneeMenuVisible}
                    onDismiss={() => setAssigneeMenuVisible(false)}
                    contentStyle={styles.menuContent}
                    anchor={
                      <TouchableOpacity style={styles.dropdown} onPress={() => setAssigneeMenuVisible(true)}>
                        <Text style={styles.dropdownLabel}>{selectedAssigneeLabel}</Text>
                      </TouchableOpacity>
                    }
                  >
                    <TouchableRipple
                      onPress={() => { setAssignee(undefined); setAssigneeMenuVisible(false); }}
                      style={styles.menuItemRow}
                    >
                      <View style={styles.menuItemInner}>
                        <Text style={styles.menuItemTitle}>Unassigned</Text>
                      </View>
                    </TouchableRipple>
                    {assigneeOptions.map(option => (
                      <TouchableRipple
                        key={option.id}
                        onPress={() => {
                          setAssignee(option.id);
                          setAssigneeMenuVisible(false);
                        }}
                        style={styles.menuItemRow}
                      >
                        <View style={styles.menuItemInner}>
                          <Text style={styles.menuItemTitle}>{option.label}</Text>
                        </View>
                      </TouchableRipple>
                    ))}
                  </Menu>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Assign to (email, optional)"
                  value={assignEmail}
                  onChangeText={setAssignEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Due date</Text>
                  {(dateInput || timeInput) && (
                    <Button compact mode="text" onPress={resetPickers}>
                      Clear
                    </Button>
                  )}
                </View>

                {Platform.OS === 'web' ? (
                  <>
                    <input
                      type="date"
                      style={{ ...styles.input, padding: 8, fontSize: 16, textAlign: 'center' }}
                      value={dateInput}
                      onChange={e => setDateInput(e.target.value)}
                    />
                    <input
                      type="time"
                      style={{ ...styles.input, padding: 8, fontSize: 16, textAlign: 'center' }}
                      value={timeInput}
                      onChange={e => setTimeInput(e.target.value)}
                    />
                  </>
                ) : (
                  <View style={{ flexDirection: 'row', width: '100%' }}>
                    <TouchableOpacity style={[styles.input, styles.nativePickerInput]} onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.nativePickerLabel}>
                        {dateInput ? new Date(dateInput).toLocaleDateString() : 'Select date'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.input, styles.nativePickerInput]} onPress={() => setShowTimePicker(true)}>
                      <Text style={styles.nativePickerLabel}>
                        {timeInput || 'Select time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={dateInput ? new Date(`${dateInput}T00:00:00`) : (isEditMode && props.task.dueDate ? new Date(props.task.dueDate) : new Date())}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type !== 'dismissed') {
                        applyNativeDate(selectedDate);
                      }
                    }}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={(() => {
                      if (dateInput || timeInput) {
                        const base = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date();
                        if (timeInput) {
                          const [h, m] = timeInput.split(':').map(Number);
                          base.setHours(h || 0, m || 0, 0, 0);
                        }
                        return base;
                      }
                      if (isEditMode && props.task.dueDate) {
                        return new Date(props.task.dueDate);
                      }
                      return new Date();
                    })()}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(false);
                      if (event.type !== 'dismissed') {
                        applyNativeTime(selectedDate);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Tags</Text>
                <TagSelector value={tags} onChange={setTags} />
              </View>

              {props.mode === 'create' && (
                <Text style={styles.helperText}>Leave blank to assign to yourself.</Text>
              )}

              <View style={styles.actionsRow}>
                <Button mode="contained" onPress={handleSave} disabled={props.isSaving}>
                  {props.isSaving ? (isEditMode ? 'Saving…' : 'Adding…') : isEditMode ? 'Save changes' : 'Add task'}
                </Button>
                <Button mode="text" onPress={props.onClose} style={{ marginLeft: 12 }}>
                  Cancel
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Portal.Host>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(90, 138, 147, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A8A93',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#EAF6F9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#9DBCC3',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },
  descriptionInput: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 16,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8A93',
    textAlign: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#9DBCC3',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#EAF6F9',
    width: '100%',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  nativePickerInput: {
    flex: 1,
    marginRight: 8,
  },
  nativePickerLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  menuContent: {
    backgroundColor: '#F5FBFC',
    borderColor: '#9DBCC3',
    borderWidth: 1,
    paddingVertical: 0,
  },
  menuItemRow: {
    width: '100%',
  },
  menuItemInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  menuItemTitle: {
    textAlign: 'center',
    color: '#5A8A93',
    width: '100%',
    lineHeight: 20,
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default TaskModal;
