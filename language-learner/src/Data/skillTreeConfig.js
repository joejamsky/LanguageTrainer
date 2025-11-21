export const ROW_TIERS = [
  { id: 'row-1', title: 'Row 1', caption: 'あ-line', value: 1 },
  { id: 'row-2', title: 'Row 2', caption: 'か-line', value: 2 },
  { id: 'row-3', title: 'Row 3', caption: 'さ-line', value: 3 },
  { id: 'row-4', title: 'Row 4', caption: 'た-line', value: 4 },
  { id: 'row-5', title: 'Row 5', caption: 'な-line', value: 5 },
  { id: 'row-6', title: 'Row 6', caption: 'は-line', value: 6 },
  { id: 'row-7', title: 'Row 7', caption: 'ま-line', value: 7 },
  { id: 'row-8', title: 'Row 8', caption: 'や-line', value: 8 },
  { id: 'row-9', title: 'Row 9', caption: 'ら-line', value: 9 },
  { id: 'row-10', title: 'Row 10', caption: 'わ-line + ん', value: 10 },
];

export const ROW_MODIFIERS = [
  {
    id: 'row-dakuten',
    title: 'Dakuten',
    caption: 'Add が/ざ/だ/ば rows',
    key: 'dakuten',
  },
  {
    id: 'row-handakuten',
    title: 'Handakuten',
    caption: 'Add ぱ row',
    key: 'handakuten',
  },
];

export const SCRIPT_NODES = [
  {
    id: 'script-hiragana',
    title: 'Hiragana',
    caption: 'あ-only practice',
    value: 'hiragana',
  },
  {
    id: 'script-katakana',
    title: 'Katakana',
    caption: 'ア-only practice',
    value: 'katakana',
  },
  {
    id: 'script-both',
    title: 'Both',
    caption: 'あ + ア pairs',
    value: 'both',
  },
];

export const SHUFFLE_NODES = [
  {
    id: 'shuffle-ordered',
    title: 'Ordered',
    caption: 'Left-to-right rows',
    value: 0,
    rowShuffle: false,
    columnShuffle: false,
  },
  {
    id: 'shuffle-row',
    title: 'Row Shuffle',
    caption: 'Shuffle within rows',
    value: 1,
    rowShuffle: true,
    columnShuffle: false,
  },
  {
    id: 'shuffle-column',
    title: 'Column Shuffle',
    caption: 'Shuffle within columns',
    value: 2,
    rowShuffle: false,
    columnShuffle: true,
  },
  {
    id: 'shuffle-grid',
    title: 'Row + Column',
    caption: 'Shuffle rows & columns',
    value: 3,
    rowShuffle: true,
    columnShuffle: true,
  },
];

export const SCRIPT_TO_LEVEL = {
  hiragana: 1,
  katakana: 2,
  both: 3,
};

export const LEVEL_TO_SCRIPT = {
  1: 'hiragana',
  2: 'katakana',
  3: 'both',
};
