import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import apacheconf from 'react-syntax-highlighter/dist/esm/languages/prism/apacheconf';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import groovy from 'react-syntax-highlighter/dist/esm/languages/prism/groovy';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import makefile from 'react-syntax-highlighter/dist/esm/languages/prism/makefile';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import perl from 'react-syntax-highlighter/dist/esm/languages/prism/perl';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import protobuf from 'react-syntax-highlighter/dist/esm/languages/prism/protobuf';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

// 2026-09-14 corpus: the blog's known grammars plus project Makefiles.
// LDIF has no bundled Prism grammar; it and unknown languages stay readable.
const grammars = { apacheconf, bash, go, groovy, ini, java, javascript, json, jsx, makefile, markup, perl, php, protobuf, python, ruby, sql, yaml };
for (const [name, grammar] of Object.entries(grammars)) SyntaxHighlighter.registerLanguage(name, grammar);

const aliases = { apache: 'apacheconf', html: 'markup', xml: 'markup', js: 'javascript', sh: 'bash', shell: 'bash', yml: 'yaml', py: 'python', rb: 'ruby' };
export function codeLanguage(value) {
  const requested = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const language = Object.hasOwn(aliases, requested) ? aliases[requested] : requested;
  return Object.hasOwn(grammars, language) ? language : 'text';
}

export default SyntaxHighlighter;
