import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Job, CreateJobInput, UpdateJobInput, JobStatus, JobPriority, PickerOption } from '../types';

interface JobFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (jobData: CreateJobInput | UpdateJobInput) => Promise<void>;
  initialValues?: Job | null;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ visible, onClose, onSubmit, initialValues }) => {
  const [company, setCompany] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [status, setStatus] = useState<JobStatus>('wishlist');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [comments, setComments] = useState<string>('');
  const [showStatusPicker, setShowStatusPicker] = useState<boolean>(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const statusOptions: PickerOption[] = [
    { label: 'Wishlist', value: 'wishlist' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Archived', value: 'archived' },
  ];

  const priorityOptions: PickerOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  useEffect(() => {
    if (initialValues) {
      setCompany(initialValues.company || '');
      setPosition(initialValues.position || '');
      setStatus(initialValues.status || 'wishlist');
      setPriority(initialValues.priority || 'medium');
      setComments(initialValues.comments || '');
    } else {
      // Reset form when opening to add new job
      resetForm();
    }
  }, [initialValues, visible]);

  const resetForm = (): void => {
    setCompany('');
    setPosition('');
    setStatus('wishlist');
    setPriority('medium');
    setComments('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!company.trim() || !position.trim()) {
      alert('Please fill in company and position');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        company: company.trim(),
        position: position.trim(),
        status,
        priority,
        comments: comments.trim(),
      });
      
      if (!initialValues) {
        resetForm();
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const getStatusLabel = (value: JobStatus): string => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getPriorityLabel = (value: JobPriority): string => {
    const option = priorityOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    options: PickerOption[],
    selectedValue: string,
    onSelect: (value: any) => void,
    title: string
  ): JSX.Element => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.pickerOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.pickerContent}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  selectedValue === option.value && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedValue === option.value && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initialValues ? 'Edit Job' : 'Add New Job'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company *</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g., Google"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Position *</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="e.g., Software Engineer"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowStatusPicker(true)}
              >
                <Text style={styles.pickerButtonText}>{getStatusLabel(status)}</Text>
                <Text style={styles.pickerButtonArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Priority</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPriorityPicker(true)}
              >
                <Text style={styles.pickerButtonText}>{getPriorityLabel(priority)}</Text>
                <Text style={styles.pickerButtonArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comments</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comments}
              onChangeText={setComments}
              placeholder="Add notes about this application..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {renderPickerModal(
          showStatusPicker,
          () => setShowStatusPicker(false),
          statusOptions,
          status,
          setStatus,
          'Select Status'
        )}

        {renderPickerModal(
          showPriorityPicker,
          () => setShowPriorityPicker(false),
          priorityOptions,
          priority,
          setPriority,
          'Select Priority'
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerButtonArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerClose: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e8f4fd',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});

export default JobFormModal;

