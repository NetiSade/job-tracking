import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';

const JobForm = ({ onSubmit, initialValues, isEditing, onCancel }) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('wishlist');
  const [priority, setPriority] = useState('medium');
  const [comments, setComments] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const statusOptions = [
    { label: 'Wishlist', value: 'wishlist' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Archived', value: 'archived' },
  ];

  const priorityOptions = [
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
    }
  }, [initialValues]);

  const handleSubmit = () => {
    if (!company.trim() || !position.trim()) {
      alert('Please fill in company and position');
      return;
    }

    onSubmit({
      company: company.trim(),
      position: position.trim(),
      status,
      priority,
      comments: comments.trim(),
    });

    if (!isEditing) {
      // Reset form after creating
      setCompany('');
      setPosition('');
      setStatus('wishlist');
      setPriority('medium');
      setComments('');
    }
  };

  const handleCancel = () => {
    setCompany('');
    setPosition('');
    setStatus('wishlist');
    setPriority('medium');
    setComments('');
    onCancel();
  };

  const getStatusLabel = (value) => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getPriorityLabel = (value) => {
    const option = priorityOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const renderPickerModal = (visible, onClose, options, selectedValue, onSelect, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value && styles.modalOptionTextSelected,
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
    <View style={styles.container}>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Job' : 'Add Job'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerButtonArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: '#e8f4fd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobForm;

