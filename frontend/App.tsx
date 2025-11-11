import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import { fetchJobs, createJob, updateJob, deleteJob } from './services/api';
import { signInAnonymously } from './services/auth';
import { Job, CreateJobInput, UpdateJobInput } from './types';

export default function App(): JSX.Element {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = await signInAnonymously();
      if (token) {
        setIsAuthenticated(true);
        loadJobs();
      } else {
        Alert.alert('Error', 'Failed to initialize app. Please restart.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please restart.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadJobs = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData: CreateJobInput): Promise<void> => {
    try {
      const newJob = await createJob(jobData);
      setJobs([newJob, ...jobs]);
      Alert.alert('Success', 'Job added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create job');
    }
  };

  const handleUpdateJob = async (jobData: UpdateJobInput): Promise<void> => {
    if (!editingJob) return;
    
    try {
      const updatedJob = await updateJob(editingJob.id, jobData);
      setJobs(jobs.map(job => job.id === editingJob.id ? updatedJob : job));
      setEditingJob(null);
      Alert.alert('Success', 'Job updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId: string): Promise<void> => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJob(jobId);
              setJobs(jobs.filter(job => job.id !== jobId));
              Alert.alert('Success', 'Job deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const handleEditJob = (job: Job): void => {
    setEditingJob(job);
  };

  const handleCancelEdit = (): void => {
    setEditingJob(null);
  };

  // Show loading spinner while authenticating
  if (isAuthenticating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to initialize app</Text>
          <Text style={styles.errorSubtext}>Please restart the application</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Tracker</Text>
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadJobs} />
        }
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {editingJob ? 'Edit Job' : 'Add New Job'}
          </Text>
          <JobForm
            onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
            initialValues={editingJob}
            isEditing={!!editingJob}
            onCancel={handleCancelEdit}
          />
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>My Applications</Text>
          <JobList
            jobs={jobs}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: '#ffffff',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listSection: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

