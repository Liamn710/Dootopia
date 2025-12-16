import TaskModal, { type CreatableTaskValues } from './TaskModal';

type AddTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreatableTaskValues) => Promise<void> | void;
  isSaving?: boolean;
  initialValues?: Partial<CreatableTaskValues>;
};

const AddTaskModal = ({ visible, onClose, onSubmit, isSaving, initialValues }: AddTaskModalProps) => (
  <TaskModal
    mode="create"
    visible={visible}
    onClose={onClose}
    onSubmit={onSubmit}
    isSaving={isSaving}
    initialValues={initialValues}
  />
);

export default AddTaskModal;
