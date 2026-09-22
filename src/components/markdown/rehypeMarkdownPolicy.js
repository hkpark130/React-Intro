import rehypeSanitize from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import {
  markdownTags, markdownAttributes, languageClassPattern, normalizeMarkdownAttributes,
} from '../../../server/notion-service/src/markdown/htmlPolicy.js';

const propertyNames = {
  class: 'className', colspan: 'colSpan', rowspan: 'rowSpan', 'data-severity': 'dataSeverity',
  'data-text-color': 'dataTextColor', 'data-background-color': 'dataBackgroundColor',
};
const attributeNames = Object.fromEntries(Object.entries(propertyNames).map(([attr, prop]) => [prop, attr]));
const schema = {
  tagNames: markdownTags,
  attributes: {
    ...Object.fromEntries(Object.entries(markdownAttributes).map(([tag, names]) => [tag, names.map(name => propertyNames[name] || name)])),
    code: [['className', languageClassPattern]],
    // Internal placeholders are consumed by React components, never spread
    // into the resulting DOM. The SSR consumes them before HTML sanitization.
    div: ['dataCustomPlaceholder'],
    span: [...markdownAttributes.span.map(name => propertyNames[name] || name), 'dataCustomPlaceholder'],
  },
  protocols: { href: ['http', 'https', 'mailto'], src: ['http', 'https'], poster: ['http', 'https'] },
  required: { input: { type: 'checkbox', disabled: true } },
  strip: ['script', 'style', 'iframe', 'svg', 'math', 'object', 'embed', 'template'],
  // Published heading fragments are part of the existing reader contract.
  // Author `name`, form attributes and arbitrary classes remain disallowed.
  clobber: [],
};

export default function rehypeMarkdownPolicy() {
  const sanitize = rehypeSanitize(schema);
  return tree => {
    visit(tree, 'element', node => {
      const attrs = Object.fromEntries(Object.entries(node.properties).map(([name, value]) => [attributeNames[name] || name, value]));
      const normalized = normalizeMarkdownAttributes(node.tagName, attrs);
      node.properties = Object.fromEntries(Object.entries(normalized).map(([name, value]) => [propertyNames[name] || name, value]));
    });
    return sanitize(tree);
  };
}
