/**
 * CreateCourseScreen
 * Form to create (or edit) a new course.
 * Fields: title, description, grade (dropdown), subject (dropdown), price, max students.
 * Validation: title and grade are required.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Button, Input } from '@/components/common';
import { createCourse, getCourseById } from '@/api/courses';
import { getGrades } from '@/api/grades';
import { getSubjects } from '@/api/subjects';
import { patch } from '@/api/client';
import { colors, spacing, typography } from '@/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DropdownItem {
  id: string;
  name: string;
}

type RouteParams = {
  CreateCourse: { courseId?: string } | undefined;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateCourseScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'CreateCourse'>>();
  const editCourseId = route.params?.courseId;
  const isEdit = !!editCourseId;
  const isRTL = I18nManager.isRTL;

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [price, setPrice] = useState('0');
  const [maxStudents, setMaxStudents] = useState('30');

  // dropdown data
  const [grades, setGrades] = useState<DropdownItem[]>([]);
  const [subjects, setSubjects] = useState<DropdownItem[]>([]);

  // ui state
  const [saving, setSaving] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // ---- load grades / subjects ----

  useEffect(() => {
    (async () => {
      try {
        setLoadingMeta(true);
        const [gradesRes, subjectsRes] = await Promise.all([
          getGrades(),
          getSubjects(),
        ]);
        setGrades(gradesRes?.data ?? gradesRes ?? []);
        setSubjects(subjectsRes?.data ?? subjectsRes ?? []);

        // If editing, pre-fill form
        if (editCourseId) {
          const course = await getCourseById(editCourseId);
          if (course) {
            setTitle(course.title ?? '');
            setDescription(course.description ?? '');
            setGradeId(course.gradeLevel ?? '');
            setSubjectId(course.subject ?? '');
            setPrice(String(course.price ?? 0));
            setMaxStudents(String(course.maxStudents ?? 30));
          }
        }
      } catch (err) {
        console.error('Failed to load form metadata:', err);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [editCourseId]);

  // ---- validation ----

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!gradeId) errs.gradeId = 'Grade is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- submit ----

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: title.trim(),
        description: description.trim() || undefined,
        gradeId,
        subjectId: subjectId || undefined,
        price: Number(price) || 0,
        maxStudents: Number(maxStudents) || 30,
      };

      if (isEdit && editCourseId) {
        await patch(`/courses/${editCourseId}`, payload);
        Alert.alert(
          t('teacher.courseUpdated', { defaultValue: 'Course Updated' }),
          t('teacher.courseUpdatedMessage', { defaultValue: 'Your course has been updated.' }),
        );
      } else {
        await createCourse(payload as any);
        Alert.alert(
          t('teacher.courseCreated', { defaultValue: 'Course Created' }),
          t('teacher.courseCreatedMessage', { defaultValue: 'Your new course has been created.' }),
        );
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setSaving(false);
    }
  }, [title, description, gradeId, subjectId, price, maxStudents, isEdit, editCourseId, navigation, t]);

  // ---- helpers ----

  const selectedGrade = grades.find((g) => g.id === gradeId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  // ---- render ----

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '>' : '<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {isEdit
            ? t('teacher.editCourse', { defaultValue: 'Edit Course' })
            : t('teacher.createCourse', { defaultValue: 'Create Course' })}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Input
            label={t('teacher.courseTitle', { defaultValue: 'Course Title' }) + ' *'}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Mathematics 101"
            error={errors.title}
            touched={!!errors.title}
          />

          {/* Description */}
          <Input
            label={t('teacher.courseDescription', { defaultValue: 'Description' })}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the course..."
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />

          {/* Grade dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>
              {t('teacher.grade', { defaultValue: 'Grade' })} *
            </Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, errors.gradeId ? styles.dropdownError : null]}
              onPress={() => {
                setShowGradeDropdown(!showGradeDropdown);
                setShowSubjectDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedGrade && styles.dropdownPlaceholder,
                ]}
              >
                {selectedGrade?.name ?? 'Select grade'}
              </Text>
              <Text style={styles.dropdownArrow}>{showGradeDropdown ? '^' : 'v'}</Text>
            </TouchableOpacity>
            {errors.gradeId && <Text style={styles.errorText}>{errors.gradeId}</Text>}
            {showGradeDropdown && (
              <View style={styles.dropdownList}>
                {grades.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.dropdownItem,
                      gradeId === g.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setGradeId(g.id);
                      setShowGradeDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        gradeId === g.id && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Subject dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>
              {t('teacher.subject', { defaultValue: 'Subject' })}
            </Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                setShowSubjectDropdown(!showSubjectDropdown);
                setShowGradeDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedSubject && styles.dropdownPlaceholder,
                ]}
              >
                {selectedSubject?.name ?? 'Select subject'}
              </Text>
              <Text style={styles.dropdownArrow}>{showSubjectDropdown ? '^' : 'v'}</Text>
            </TouchableOpacity>
            {showSubjectDropdown && (
              <View style={styles.dropdownList}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.dropdownItem,
                      subjectId === s.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSubjectId(s.id);
                      setShowSubjectDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        subjectId === s.id && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Price */}
          <Input
            label={t('teacher.price', { defaultValue: 'Price ($)' })}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
          />

          {/* Max students */}
          <Input
            label={t('teacher.maxStudents', { defaultValue: 'Max Students' })}
            value={maxStudents}
            onChangeText={setMaxStudents}
            keyboardType="numeric"
            placeholder="30"
          />

          {/* Submit */}
          <Button
            title={
              isEdit
                ? t('common.save', { defaultValue: 'Save' })
                : t('teacher.createCourse', { defaultValue: 'Create Course' })
            }
            onPress={handleSubmit}
            loading={saving}
            disabled={saving || loadingMeta}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen.horizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  headerTitle: {
    ...typography.textStyles.h4,
    flex: 1,
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    padding: spacing.screen.horizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },

  // Multiline input
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Dropdown
  dropdownContainer: {
    marginBottom: spacing.margin.sm,
  },
  dropdownLabel: {
    ...typography.textStyles.label,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.input.paddingHorizontal,
    paddingVertical: spacing.input.paddingVertical,
    minHeight: 48,
  },
  dropdownError: {
    borderColor: colors.error,
  },
  dropdownText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: colors.textTertiary,
  },
  dropdownArrow: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownList: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.sm,
    marginTop: spacing.xs,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: spacing.input.paddingHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  errorText: {
    ...typography.textStyles.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },

  submitButton: {
    marginTop: spacing.xl,
  },

  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default CreateCourseScreen;
