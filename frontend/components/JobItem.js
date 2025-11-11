import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const JobItem = ({ job, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'wishlist':
        return '#9b59b6';
      case 'in_progress':
        return '#3498db';
      case 'archived':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#2ecc71';
      default:
        return '#7f8c8d';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: getPriorityColor(job.priority) },
              ]}
            >
              <Text style={styles.badgeText}>
                {job.priority.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: getStatusColor(job.status) },
              ]}
            >
              <Text style={styles.badgeText}>{formatStatus(job.status)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.position}>{job.position}</Text>

        {job.comments && (
          <Text style={styles.comments} numberOfLines={2}>
            {job.comments}
          </Text>
        )}

        <Text style={styles.date}>
          Added {formatDate(job.created_at)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => onEdit(job)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(job.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  company: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  position: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  comments: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4a90e2',
    marginRight: 4,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    marginLeft: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JobItem;

