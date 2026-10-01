import React from 'react';
import Markdown from 'react-native-markdown-display';
import { colors, fontSize, spacing } from '@/theme/theme';

export function MarkdownMessage({ text, isUser = false }: { text: string; isUser?: boolean }) {
  const foreground = isUser ? colors.textOnDark : colors.textPrimary;
  const subdued = isUser ? 'rgba(255,255,255,0.8)' : colors.textSecondary;

  return (
    <Markdown
      style={{
        body: { color: foreground, fontSize: fontSize.md, lineHeight: 24 },
        paragraph: { color: foreground, marginTop: 0, marginBottom: spacing.sm },
        heading1: { color: foreground, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
        heading2: { color: foreground, fontSize: fontSize.lg, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
        heading3: { color: foreground, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs },
        bullet_list: { marginVertical: spacing.xs },
        ordered_list: { marginVertical: spacing.xs },
        list_item: { marginVertical: 2 },
        strong: { color: foreground, fontWeight: '700' },
        em: { color: foreground, fontStyle: 'italic' },
        blockquote: { borderLeftColor: subdued, borderLeftWidth: 3, paddingLeft: spacing.sm },
        code_inline: { color: foreground, backgroundColor: isUser ? 'rgba(255,255,255,0.16)' : colors.border, fontFamily: 'monospace' },
        code_block: { color: foreground, backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : colors.background, fontFamily: 'monospace', padding: spacing.sm },
        fence: { color: foreground, backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : colors.background, fontFamily: 'monospace', padding: spacing.sm },
        link: { color: isUser ? colors.textOnDark : colors.primary, textDecorationLine: 'underline' },
        table: { borderColor: subdued, borderWidth: 1 },
        th: { color: foreground, borderColor: subdued, borderWidth: 1, padding: spacing.xs },
        tr: { borderBottomColor: subdued, borderBottomWidth: 1 },
        td: { color: foreground, borderColor: subdued, borderWidth: 1, padding: spacing.xs },
        hr: { backgroundColor: subdued },
      }}
    >
      {text || ' '}
    </Markdown>
  );
}
