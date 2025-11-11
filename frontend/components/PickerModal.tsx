import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { PickerOption } from "../types";

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const handleSelect = (value: string): void => {
    onSelect(value);
    onClose();
  };

  const handleOverlayPress = (): void => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  doneButton: {
    fontSize: 16,
    color: "#4a90e2",
    fontWeight: "600",
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionSelected: {
    backgroundColor: "#e8f4fd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    color: "#4a90e2",
    fontWeight: "600",
  },
});

export default PickerModal;

