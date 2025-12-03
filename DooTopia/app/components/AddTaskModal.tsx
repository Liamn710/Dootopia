import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Menu, Portal, Text } from 'react-native-paper';
import type { Tag as TagItem } from '../types/Task';
import TagSelector from './Tag';
interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (assignToId: string) => void;
  taskTitle: string;
  setTaskTitle: (v: string) => void;
  taskText: string;
  setTaskText: (v: string) => void;
  taskPoints: string;
  setTaskPoints: (v: string) => void;
  assignEmail: string;
  setAssignEmail: (v: string) => void;
  isAssignLoading: boolean;
  dueDate: string;
  setDueDate: (v: string) => void;
  tags: TagItem[];
  setTags: (tags: TagItem[]) => void;
  durationMinutes?: string;
  setDurationMinutes?: (v: string) => void;
}

const AddTaskModal = ({ visible, onClose, onAdd, taskTitle, setTaskTitle, taskText, setTaskText, taskPoints, setTaskPoints, assignEmail, setAssignEmail, dueDate, setDueDate, tags, setTags, durationMinutes, setDurationMinutes }: AddTaskModalProps) => {
  const [pointsMenuVisible, setPointsMenuVisible] = useState(false);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const [descriptionHeight, setDescriptionHeight] = useState(120);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const currentTimeLabel = useMemo(() => {
    if (!dueDate) return '';
    const d = new Date(dueDate);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }, [dueDate]);

  const applyTimeToDueDate = (hours: number, minutes: number) => {
    const base = dueDate ? new Date(dueDate) : new Date();
    const updated = new Date(base);
    updated.setHours(hours, minutes, 0, 0);
    setDueDate(updated.toISOString());
  };


  const openPointsMenu = () => setPointsMenuVisible(true);
  const closePointsMenu = () => setPointsMenuVisible(false);
  const handleSelectPoints = (value: string) => {
    setTaskPoints(value);
    closePointsMenu();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Portal.Host>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput, { height: Math.max(120, descriptionHeight) }]}
            placeholder="Task Description"
            value={taskText}
            onChangeText={setTaskText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onContentSizeChange={event => setDescriptionHeight(event.nativeEvent.contentSize.height)}
          />
          {/* Tags selector */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: '#5A8A93', marginBottom: 6, fontWeight: '600' }}>Tags</Text>
            <TagSelector value={tags} onChange={setTags} maxTags={10} />
          </View>
            <TextInput
              style={styles.input}
              placeholder="Assign to (email, optional)"
              value={assignEmail}
              onChangeText={setAssignEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {Platform.OS === 'web' ? (
              <>
                <input
                  type="date"
                  style={{ ...styles.input, padding: 8, fontSize: 16 }}
                  value={dueDate ? dueDate.substring(0, 10) : ''}
                  onChange={e => {
                    const dateStr = e.target.value; // YYYY-MM-DD
                    if (!dateStr) { setDueDate(''); return; }
                    const base = dueDate ? new Date(dueDate) : new Date();
                    const [y, m, d] = dateStr.split('-').map(Number);
                    const updated = new Date(base);
                    updated.setFullYear(y, (m - 1), d);
                    setDueDate(updated.toISOString());
                  }}
                />
                <input
                  type="time"
                  style={{ ...styles.input, padding: 8, fontSize: 16 }}
                  value={currentTimeLabel}
                  onChange={e => {
                    const val = e.target.value; // HH:MM
                    if (!val) return;
                    const [hh, mm] = val.split(':').map(Number);
                    applyTimeToDueDate(hh, mm);
                  }}
                />
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ fontSize: 16, color: dueDate ? '#000' : '#999' }}>
                    {dueDate ? new Date(dueDate).toLocaleDateString() : 'Due Date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate ? new Date(dueDate) : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDueDate(selectedDate.toISOString());
                      }
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ fontSize: 16, color: currentTimeLabel ? '#000' : '#999' }}>
                    {currentTimeLabel || 'Due Time (optional)'}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate ? new Date(dueDate) : new Date()}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(false);
                      if (selectedDate) {
                        const h = selectedDate.getHours();
                        const m = selectedDate.getMinutes();
                        applyTimeToDueDate(h, m);
                      }
                    }}
                  />
                )}
              </>
            )}
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
              Leave blank to assign to yourself
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Duration (minutes, optional)"
              keyboardType="numeric"
              value={durationMinutes ?? ''}
              onChangeText={(v) => setDurationMinutes?.(v.replace(/[^0-9]/g, ''))}
            />
          <View style={styles.menuWrapper}>
            <Menu
              visible={pointsMenuVisible}
              onDismiss={closePointsMenu}
              anchorPosition="bottom"
              contentStyle={[styles.menuContent, menuWidth ? { width: menuWidth } : null]}
              anchor={
                <View
                  onLayout={({ nativeEvent }) => setMenuWidth(nativeEvent.layout.width)}
                  style={styles.dropdownAnchor}
                >
                  <Button
                    mode="outlined"
                    onPress={openPointsMenu}
                    style={styles.dropdownButton}
                    contentStyle={styles.dropdownButtonContent}
                  >
                    {taskPoints ? `${taskPoints} pts` : 'Select Points'}
                  </Button>
                </View>
              }
            >
              {[1, 3, 5, 10].map(option => (
                <Menu.Item
                  key={option}
                  onPress={() => handleSelectPoints(option.toString())}
                  title={`${option} pts`}
                />
              ))}
            </Menu>
          </View>
            <View style={styles.modalButtons}>
              <Button mode="contained" onPress={() => onAdd(assignEmail)} disabled={!taskTitle || !taskPoints}>
                Add
              </Button>
              <Button mode="outlined" onPress={onClose} style={{ marginLeft: 10 }}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Portal.Host>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(90, 138, 147, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#5A8A93",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5A8A93",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#EAF6F9",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#9DBCC3",
    fontSize: 16,
  },
  descriptionInput: {
    paddingVertical: 16,
  },
  menuWrapper: {
    marginBottom: 15,
  },
  menuContent: {
    paddingVertical: 0,
  },
  dropdownAnchor: {
    width: '100%',
  },
  dropdownButton: {
    borderColor: '#9DBCC3',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
  },
  dropdownButtonContent: {
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
});

export default AddTaskModal;
