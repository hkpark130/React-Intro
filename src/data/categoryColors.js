export const DEFAULT_CATEGORY_COLOR = { bg: '#f1f5f9', fg: '#334155' };

const MAP = {
  'ALL': { bg: '#0f172a', fg: '#ffffff' },
  'Work Experience': { bg: '#eff6ff', fg: '#1e40af' },
  'Kubernetes': { bg: '#f0f9ff', fg: '#0369a1' },
  'Spring Boot': { bg: '#f0fdf4', fg: '#065f46' },
  'Spring': { bg: '#f0fdf4', fg: '#065f46' },
  'Go': { bg: '#ecfccb', fg: '#365314' },
  'Terraform': { bg: '#ede9fe', fg: '#5b21b6' },
  'CS 지식': { bg: '#fef3c7', fg: '#92400e' },
  '회고': { bg: '#fef3c7', fg: '#92400e' },
  'Etc': DEFAULT_CATEGORY_COLOR,
};

export function getCategoryColor(name) {
  return MAP[name] ?? DEFAULT_CATEGORY_COLOR;
}
