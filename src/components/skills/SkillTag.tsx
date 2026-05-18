import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Skill } from '../../types';

interface Props {
  skill: Skill;
  variant?: 'offered' | 'wanted' | 'neutral';
  onRemove?: () => void;
}

export const SkillTag: React.FC<Props> = ({ skill, variant = 'neutral', onRemove }) => {
  const bg = {
    offered: Colors.accentTransparent,
    wanted: Colors.primaryTransparent,
    neutral: Colors.surfaceLight,
  }[variant];

  const border = {
    offered: Colors.accent,
    wanted: Colors.primary,
    neutral: Colors.border,
  }[variant];

  const textColor = {
    offered: Colors.accent,
    wanted: Colors.primary,
    neutral: Colors.textSecondary,
  }[variant];

  return (
    <TouchableOpacity
      style={[styles.tag, { backgroundColor: bg, borderColor: border }]}
      onPress={onRemove}
      disabled={!onRemove}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {skill.name} {onRemove ? '×' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
