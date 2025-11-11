import React, { useCallback } from "react";
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
} from "react-native";
import { Job, CreateJobInput, UpdateJobInput } from "../types";
import { useJobForm } from "../hooks/useJobForm";
import PickerModal from "./PickerModal";

interface JobFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (jobData: CreateJobInput | UpdateJobInput) => Promise<void>;
  initialValues?: Job | null;
}

const JobFormModal: React.FC<JobFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const {
    company,
    position,
    status,
    priority,
    comments,
    showStatusPicker,
    showPriorityPicker,
    isSubmitting,
    setCompany,
    setPosition,
    setStatus,
    setPriority,
    setComments,
    setShowStatusPicker,
    setShowPriorityPicker,
    setIsSubmitting,
    resetForm,
    statusOptions,
    priorityOptions,
  } = useJobForm(initialValues);

  const isEditing = !!initialValues;
  const title = isEditing ? "Edit Job" : "Add New Job";
  const submitLabel = isSubmitting ? "Saving..." : "Save";

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!company.trim() || !position.trim()) {
      alert("Please fill in company and position");
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

      if (!isEditing) {
        resetForm();
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    company,
    position,
    status,
    priority,
    comments,
    isEditing,
    onSubmit,
    onClose,
    resetForm,
  ]);

  const handleClose = useCallback((): void => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const getStatusLabel = (value: string): string => {
    return (
      statusOptions.find((opt) => opt.value === value)?.label || value
    );
  };

  const getPriorityLabel = (value: string): string => {
    return (
      priorityOptions.find((opt) => opt.value === value)?.label || value
    );
  };

  const openStatusPicker = useCallback((): void => {
    setShowStatusPicker(true);
  }, []);

  const closeStatusPicker = useCallback((): void => {
    setShowStatusPicker(false);
  }, []);

  const openPriorityPicker = useCallback((): void => {
    setShowPriorityPicker(true);
  }, []);

  const closePriorityPicker = useCallback((): void => {
    setShowPriorityPicker(false);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
            <Text
              style={[
                styles.saveButton,
                isSubmitting && styles.saveButtonDisabled,
              ]}
            >
              {submitLabel}
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
                onPress={openStatusPicker}
              >
                <Text style={styles.pickerButtonText}>
                  {getStatusLabel(status)}
                </Text>
                <Text style={styles.pickerButtonArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Priority</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={openPriorityPicker}
              >
                <Text style={styles.pickerButtonText}>
                  {getPriorityLabel(priority)}
                </Text>
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

        <PickerModal
          visible={showStatusPicker}
          title="Select Status"
          options={statusOptions}
          selectedValue={status}
          onSelect={(value) => setStatus(value as any)}
          onClose={closeStatusPicker}
        />

        <PickerModal
          visible={showPriorityPicker}
          title="Select Priority"
          options={priorityOptions}
          selectedValue={priority}
          onSelect={(value) => setPriority(value as any)}
          onClose={closePriorityPicker}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: "#4a90e2",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -6,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  pickerButtonArrow: {
    fontSize: 12,
    color: "#666",
  },
});

export default JobFormModal;
