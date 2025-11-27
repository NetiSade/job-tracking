import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Portal, Dialog, Button, TextInput, Text } from "react-native-paper";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";
import { useJobForm } from "../hooks/useJobForm";
import PickerModal from "./PickerModal";
import { useTheme } from "../context/ThemeContext";

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
  const { colors } = useTheme();
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

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.content}>
            <TextInput
              label="Company *"
              value={company}
              onChangeText={setCompany}
              placeholder="e.g., Google"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Position *"
              value={position}
              onChangeText={setPosition}
              placeholder="e.g., Software Engineer"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={{ marginBottom: 8, color: colors.text }}>
                Status
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowStatusPicker(true)}
                icon="chevron-down"
                contentStyle={{ justifyContent: "space-between" }}
                style={styles.pickerButton}
              >
                {getStatusLabel(status)}
              </Button>
            </View>

            <TextInput
              label="Salary Expectations"
              value={salaryExpectations}
              onChangeText={setSalaryExpectations}
              placeholder="e.g., $120k base"
              mode="outlined"
              style={styles.input}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Save
          </Button>
        </Dialog.Actions>

        <PickerModal
          visible={showStatusPicker}
          title="Select Status"
          options={statusOptions}
          selectedValue={status}
          onSelect={(value) => setStatus(value as JobStatus)}
          onClose={() => setShowStatusPicker(false)}
        />
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  pickerButton: {
    justifyContent: "flex-start",
  },
});

export default JobFormModal;
