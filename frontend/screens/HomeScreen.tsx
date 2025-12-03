import React, { useCallback } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavigation } from "react-native-paper";
import AppHeader from "../components/AppHeader";
import FloatingActionButton from "../components/FloatingActionButton";
import JobFormModal from "../components/JobFormModal";
import JobCommentsModal from "../components/JobCommentsModal";
import JobList from "../components/JobList";
import LoadingScreen from "../components/LoadingScreen";
import { SettingsModal } from "../components/SettingsModal";
import { AboutScreen } from "../screens/AboutScreen";
import { WelcomeModal } from "../components/WelcomeModal";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeColors } from "../constants/theme";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { JobStatus } from "../types";

const HomeScreen: React.FC = () => {
  const {
    isAuthenticating,
    isInitialLoading,
    loading,
    jobs,
    loadJobs,
    handleDeleteJob,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleReorderJobs,
    isDark,
    isJobFormVisible,
    editingJob,
    isCommentsModalVisible,
    isSettingsModalVisible,
    setIsSettingsModalVisible,
    isAboutModalVisible,
    setIsAboutModalVisible,
    isWelcomeModalVisible,
    index,
    routes,
    commentJob,
    handleOpenAddModal,
    handleEditJob,
    handleCloseJobForm,
    handleSubmitJob,
    handleChangeJobStatus,
    handleViewComments,
    handleCloseComments,
    handleCloseWelcome,
    handleIndexChange,
  } = useHomeScreen();

  const customTheme = useCustomTheme();
  const styles = useThemedStyles(stylesFactory);
  const insets = useSafeAreaInsets();

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => {
      const status = route.key as JobStatus;
      const filteredJobs = jobs.filter((job) => job.status === status);

      return (
        <View style={[styles.listSection, { paddingBottom: insets.bottom }]}>
          <JobList
            jobs={filteredJobs}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onViewComments={handleViewComments}
            onChangeStatus={handleChangeJobStatus}
            onReorder={handleReorderJobs}
            refreshing={loading}
            onRefresh={() => {
              void loadJobs();
            }}
          />
        </View>
      );
    },
    [
      jobs,
      handleEditJob,
      handleDeleteJob,
      handleViewComments,
      handleChangeJobStatus,
      handleReorderJobs,
      loading,
      loadJobs,
      styles.listSection,
      insets.bottom,
    ]
  );

  // Render logic
  if (isAuthenticating) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingScreen />
      </SafeAreaView>
    );
  }

  if (isInitialLoading) {
    return (
      <>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <AppHeader onSettingsPress={() => setIsSettingsModalVisible(true)} />
        <View
          style={[
            styles.container,
            styles.centerContent,
            { backgroundColor: customTheme.colors.background },
          ]}
        >
          <LoadingScreen />
        </View>
      </>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: customTheme.colors.background },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader onSettingsPress={() => setIsSettingsModalVisible(true)} />

      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={handleIndexChange}
        renderScene={renderScene}
        barStyle={{ backgroundColor: customTheme.colors.card }}
        activeColor={customTheme.colors.primary}
        inactiveColor={customTheme.colors.textSecondary}
      />

      <FloatingActionButton onPress={handleOpenAddModal} />

      <JobFormModal
        visible={isJobFormVisible}
        onClose={handleCloseJobForm}
        onSubmit={handleSubmitJob}
        initialValues={editingJob}
      />

      <JobCommentsModal
        visible={isCommentsModalVisible}
        job={commentJob}
        onClose={handleCloseComments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />

      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onAboutPress={() => {
          setIsSettingsModalVisible(false);
          setIsAboutModalVisible(true);
        }}
      />

      <AboutScreen
        visible={isAboutModalVisible}
        onClose={() => setIsAboutModalVisible(false)}
      />

      <WelcomeModal
        visible={isWelcomeModalVisible}
        onClose={handleCloseWelcome}
      />
    </View>
  );
};

const stylesFactory = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listSection: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 0,
    },
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default HomeScreen;
