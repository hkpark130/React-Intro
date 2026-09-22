// Literal expectations shared by the two real rendering entry points.
export const rejectedUrls = [
  'javascript:example()',
  'JaVaScRiPt:example()',
  'jav&#x61;script:example()',
  'java&#10;script:example()',
  'data:image/svg+xml,&lt;svg&gt;&lt;/svg&gt;',
  'vbscript:example()',
  'file:///example.txt',
  '//example.com/untrusted',
  '&#x2f;&#x2f;example.com/untrusted',
  'https://reader:password@example.com/untrusted',
  String.raw`https:\example.com/untrusted`,
  String.raw`/\example.com/untrusted`,
  'https://example.com/line&#13;break',
];

export const urlMarkup = url => `<a href="${url}" title="source-policy">Source</a>

<img src="${url}" alt="image-policy">

<video src="${url}" poster="${url}"><source src="${url}" type="video/mp4"></video>

<Bookmark url="${url}" title="Bookmark source" imageUrl="${url}" />

<ZoomableImageModal src="${url}" alt="custom-image-policy" />`;

export const unsafeMarkup = `<div id="body-policy" name="location" style="position:fixed;inset:0;background-image:url(https://example.com/tracker);color:red" onclick="example()">Visible content</div>

<a href="https://example.com/reference" title="safe-link" target="_self" onclick="example()">Reference</a>

<table><tbody><tr><td id="cell-policy" align="right" colspan="2" rowspan="3" style="text-align:center;background-image:url(https://example.com/tracker);color:red">Wide cell</td></tr></tbody></table>

<input type="text" value="untrusted" autofocus onfocus="example()" checked>

<script id="attack-script">example()</script>
<iframe id="attack-frame" src="https://example.com"></iframe>
<svg id="attack-svg" onload="example()"><a href="javascript:example()">vector</a></svg>
<math id="attack-math"><mtext>math</mtext></math>
<style id="attack-style">body { display:none }</style>`;

export const encodedCodeMarkup = `<CodeAccordion contentEncoding="html" title="Encoded example" language="text" defaultExpanded="true" showLineNumbers="false">
const end = "&lt;/CodeAccordion&gt;";
const entity = "&amp;lt;tag&amp;gt;";
&lt;script&gt;example()&lt;/script&gt;
</CodeAccordion>

After **the complete example**`;

export const decodedCode = 'const end = "</CodeAccordion>";\nconst entity = "&lt;tag&gt;";\n<script>example()</script>';

export const encodedAlertMarkup = `<AlertBlock contentEncoding="html" severity="warning">
Before \`&lt;/AlertBlock&gt;\` remains inside.

&lt;AlertBlock&gt;**Nested note**&lt;/AlertBlock&gt;

&lt;a href="javascript:example()"&gt;Unsafe destination&lt;/a&gt;
</AlertBlock>

After the alert`;
