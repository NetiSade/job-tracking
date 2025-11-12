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
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";
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
    salaryExpectations,
    showStatusPicker,
    isSubmitting,
    setCompany,
    setPosition,
    setStatus,
    setSalaryExpectations,
    setShowStatusPicker,
    setIsSubmitting,
    resetForm,
    statusOptions,
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
      const trimmedSalary = salaryExpectations.trim();
      await onSubmit({
        company: company.trim(),
        position: position.trim(),
        status,
        salary_expectations: trimmedSalary.length > 0 ? trimmedSalary : null,
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
    salaryExpectations,
    isEditing,
    onSubmit,
    onClose,
    resetForm,
  ]);

  const handleClose = useCallback((): void => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const getStatusLabel = (value: string): string =>
    statusOptions.find((opt) => opt.value === value)?.label || value;

  const openStatusPicker = useCallback((): void => {
    setShowStatusPicker(true);
  }, [setShowStatusPicker]);

  const closeStatusPicker = useCallback((): void => {
    setShowStatusPicker(false);
  }, [setShowStatusPicker]);

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

          <View style={styles.inputGroup}>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salary Expectations</Text>
            <TextInput
              style={styles.input}
              value={salaryExpectations}
              onChangeText={setSalaryExpectations}
              placeholder="e.g., $120k base"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        <PickerModal
          visible={showStatusPicker}
          title="Select Status"
          options={statusOptions}
          selectedValue={status}
          onSelect={(value) => setStatus(value as JobStatus)}
          onClose={closeStatusPicker}
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
