import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openstackApplications, openstackNodes, openstackSnapshot } from '../src/data/openstackArchitecture.js';

// This generator reads curated public data and original public brand assets only.
// It never reads the source infrastructure snapshot or connects to a service.
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const brandRoot = path.join(projectRoot, 'public', 'brands');
const outputDirectory = path.join(projectRoot, 'public', 'architecture');
const outputPath = path.join(outputDirectory, 'openstack-deployment.svg');
const previewRoot = path.resolve(projectRoot, '..', '.local', 'openstack-architecture-preview');
const width = 1440;
const height = 1530;

assert.equal(openstackSnapshot.nodes, 12);
assert.equal(openstackSnapshot.lxdContainers, 24);
assert.equal(openstackSnapshot.computeNodes, 11);
assert.equal(openstackSnapshot.applications, 43);
assert.equal(openstackSnapshot.applicationsWithUnits, 42);
assert.equal(openstackSnapshot.principalUnits, 43);
assert.equal(openstackSnapshot.subordinateUnits, 29);
assert.equal(openstackSnapshot.units, 72);
assert.equal(openstackSnapshot.mysqlRouterApplications, 12);
assert.equal(openstackSnapshot.mysqlRouterUnits, 12);
const vaultRouter = openstackApplications.find((app) => app.name === 'vault-mysql-router');
assert.equal(vaultRouter.kind, 'subordinate');
assert.equal(vaultRouter.units.length, 1);
assert.equal(vaultRouter.units[0].node, 'D');
assert.equal(vaultRouter.units[0].container, 'D-LXD-01');
assert.equal(vaultRouter.units[0].principal.app, 'vault');
const sharedNodes = openstackNodes.filter((node) => node.containers.length);
const additionalComputeNodes = openstackNodes.filter((node) => !node.containers.length);
assert.equal(sharedNodes.length, 4);
assert.ok(sharedNodes.every((node) => node.containers.length === 6));
assert.equal(sharedNodes.filter((node) => node.hasCompute).length, 3);
assert.equal(additionalComputeNodes.length, 8);
assert.ok(additionalComputeNodes.every((node) => node.hasCompute));
const chassisUnits = openstackApplications.find((app) => app.name === 'ovn-chassis').units;
assert.equal(chassisUnits.length, 12);
assert.equal(new Set(chassisUnits.map((unit) => unit.node)).size, 11);

const brandFiles = {
  maas: 'maas.svg',
  juju: 'juju.png',
  openstack: 'openstack.svg',
  nova: 'nova.png',
  ceph: 'ceph.png',
};
const brandManifest = JSON.parse(await readFile(path.join(brandRoot, 'sources.json'), 'utf8'));
const brands = Object.fromEntries(await Promise.all(Object.entries(brandFiles).map(async ([name, file]) => {
  const source = brandManifest.assets.find((asset) => asset.file === file);
  assert.ok(source?.sourceUrl, `Missing original brand source for ${file}`);
  const data = await readFile(path.join(brandRoot, file));
  return [name, {
    dataUri: `data:${file.endsWith('.svg') ? 'image/svg+xml' : 'image/png'};base64,${data.toString('base64')}`,
    name: source.name,
    source: source.sourceUrl,
    license: source.license,
  }];
})));

const palette = {
  ink: '#24324b', muted: '#607087', border: '#c7d3e3',
  blue: '#2463b8', blueFill: '#edf4ff',
  purple: '#6a4bc4', purpleFill: '#f5f2fc',
  green: '#267264', greenFill: '#edf7f3',
};
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[character]));
const text = (x, y, value, size = 22, options = {}) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${options.weight || 400}" fill="${options.fill || palette.ink}"${options.anchor ? ` text-anchor="${options.anchor}"` : ''}>${escapeXml(value)}</text>`;
const rect = (x, y, boxWidth, boxHeight, fill = '#fff', stroke = palette.border, radius = 8, extra = '') => `<rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="${radius}" fill="${fill}" stroke="${stroke}"${extra ? ` ${extra}` : ''}/>`;
const logo = (name, x, y, boxWidth, boxHeight) => `<image x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" preserveAspectRatio="xMidYMid meet" href="${brands[name].dataUri}"><title>${escapeXml(brands[name].name)}</title></image>`;
const roleColor = (role) => role === 'storage' ? palette.green : role === 'compute' ? palette.blue : palette.purple;
const directChip = (unit, x, y) => {
  const color = roleColor(unit.role);
  return `${rect(x, y, 134, 32, unit.role === 'storage' ? palette.greenFill : unit.role === 'compute' ? palette.blueFill : palette.purpleFill, 'none', 4)}${text(x + 9, y + 22, unit.label, 17, { fill: color, weight: 600 })}`;
};

function renderSharedNode(node, x) {
  const y = 519;
  const frame = [
    rect(x, y, 312, 501),
    rect(x + 1, y + 1, 310, 77, node.hasCompute ? palette.blueFill : palette.purpleFill, 'none', 7),
    text(x + 16, y + 33, node.label, 25, { weight: 700 }),
    text(x + 16, y + 64, node.hasCompute ? '제어·스토리지 + Compute' : '제어·스토리지', 19, { fill: node.hasCompute ? palette.blue : palette.purple, weight: 600 }),
    text(x + 16, 621, '상위 머신에 직접 배치', 17, { fill: palette.muted }),
    ...node.direct.map((unit, index) => directChip(unit, x + 16 + (index % 2) * 146, 635 + Math.floor(index / 2) * 40)),
    rect(x + 16, 724, 280, 276, '#fdfcff', '#dcd3ed', 6),
    text(x + 30, 750, '내부 LXD 6개', 20, { fill: palette.purple, weight: 600 }),
    ...node.containers.map((unit, index) => {
      const cellY = 767 + index * 37;
      const attached = openstackApplications.filter((app) => app.kind === 'subordinate' && app.units.some((child) => child.principal?.unit === unit.id));
      const description = `${unit.container}: ${unit.app}${attached.length ? `; subordinate: ${attached.map((app) => app.name).join(', ')}` : ''}`;
      return `<g><title>${escapeXml(description)}</title>${rect(x + 28, cellY, 256, 31, '#fff', '#e5dfef', 3)}${text(x + 38, cellY + 22, String(unit.containerOrder), 17, { fill: palette.muted })}${text(x + 67, cellY + 22, unit.label, 18, { fill: roleColor(unit.role) })}</g>`;
    }),
  ];
  return `<g aria-label="${escapeXml(`${node.label}: LXD 6개${node.hasCompute ? ', Compute 겸용' : ', Compute 없음'}`)}">${frame.join('')}</g>`;
}

const metadata = {
  title: 'OpenStack 노드·서비스 배치',
  configurationDate: openstackSnapshot.date,
  scope: 'MAAS cloud OpenStack workload model; nodes and units are public aliases.',
  interpretation: 'Solid nested boundaries show placement. Dashed arrows show management responsibilities, not VM traffic. MAAS/Juju management host counts and gateway election are not included.',
  inventory: {
    applications: openstackSnapshot.applications,
    applicationsWithUnits: openstackSnapshot.applicationsWithUnits,
    units: openstackSnapshot.units,
    principalUnits: openstackSnapshot.principalUnits,
    subordinateUnits: openstackSnapshot.subordinateUnits,
    mysqlRouterUnits: openstackSnapshot.mysqlRouterUnits,
  },
  brands: Object.values(brands).map(({ name, source, license }) => ({ name, source, license })),
  novaAttribution: 'Nova project mascot artwork by the OpenStack Foundation; CC BY-ND, version not specified by the official source. Original artwork embedded without modification.',
};

const parts = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diagram-title diagram-description">`,
  '<title id="diagram-title">OpenStack 노드·서비스 배치 — 2026-09-11</title>',
  `<desc id="diagram-description">상위 노드 12대 중 공유 서비스와 스토리지를 둔 4대에 LXD가 각각 6개 있습니다. 이 중 3대는 Compute를 겸하고 추가 Compute 8대와 함께 VM 102개를 실행합니다. OVN Chassis는 12유닛이지만 상위 머신 11대에 배치됩니다. Ceph OSD 4유닛과 OSD 데몬 15개는 서로 다른 단위입니다. 전체 ${openstackSnapshot.applications}앱 중 ${openstackSnapshot.applicationsWithUnits}앱에 ${openstackSnapshot.units}유닛이 있으며 principal ${openstackSnapshot.principalUnits}개와 subordinate ${openstackSnapshot.subordinateUnits}개입니다. MySQL Router는 ${openstackSnapshot.mysqlRouterUnits}유닛이며 Vault의 Router는 D-LXD-01의 Vault와 함께 배치됩니다. 셀의 서비스명은 principal이며 subordinate는 셀 설명과 별도 유닛 목록에 기재합니다. MAAS와 Juju 관리 서버 수는 포함하지 않았습니다. 노드와 LXD 이름은 공개용 별칭입니다.</desc>`,
  `<metadata>${escapeXml(JSON.stringify(metadata))}</metadata>`,
  `<defs><marker id="management-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#75849a"/></marker></defs>`,
  `<style>text{font-family:"Malgun Gothic","Apple SD Gothic Neo","Noto Sans CJK KR",Arial,sans-serif}a text{text-decoration:underline;text-underline-offset:3px}a:focus{outline:2px solid #2463b8}</style>`,
  rect(0, 0, width, height, '#fff', 'none', 0),
  text(48, 63, 'OpenStack 노드·서비스 배치', 38, { weight: 700 }),
  text(48, 103, '상위 머신 안에 제어 서비스·스토리지·Compute를 함께 배치한 구조', 22, { fill: palette.muted }),
  text(48, 138, '관리 계층', 20, { weight: 600 }),
  text(1392, 138, '관리 호스트의 위치·수는 이 스냅샷에 미수록', 18, { fill: palette.muted, anchor: 'end' }),
  rect(48, 154, 1344, 116, '#fafbfd', '#bac6d5', 8, 'stroke-dasharray="7 5"'),
  rect(79, 184, 48, 48, '#202020', 'none', 6),
  logo('maas', 85, 190, 36, 36),
  text(146, 198, 'MAAS', 25, { weight: 700 }),
  text(146, 233, '물리 서버 준비·전원·OS 프로비저닝', 22),
  logo('juju', 761, 184, 48, 48),
  text(828, 198, 'Juju', 25, { weight: 700 }),
  text(828, 233, 'charm application·unit 배치 관리', 22),
  '<path d="M 386 270 V 349" fill="none" stroke="#75849a" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#management-arrow)"/>',
  '<path d="M 1054 270 V 349" fill="none" stroke="#75849a" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#management-arrow)"/>',
  text(404, 316, '서버 준비', 19, { fill: palette.muted }),
  text(1072, 316, '서비스 배치', 19, { fill: palette.muted }),
  rect(32, 350, 1376, 1040, '#fff', '#aabbd2', 12, 'stroke-width="2"'),
  logo('openstack', 58, 382, 52, 52),
  text(128, 407, 'OpenStack 상위 노드 12대', 31, { weight: 700 }),
  text(128, 442, '공유 서비스·스토리지 4대 + 추가 Compute 8대', 21, { fill: palette.muted }),
  text(1378, 407, `${openstackSnapshot.date} 스냅샷`, 21, { fill: palette.muted, anchor: 'end' }),
  text(58, 483, '공유 서비스·스토리지 노드 4대', 25, { weight: 700 }),
  text(1370, 483, 'Compute 겸용 3대 · LXD 합계 24개', 21, { fill: palette.purple, anchor: 'end' }),
  rect(52, 500, 1336, 542, '#f8f9fc', '#e0e5ed', 8),
  ...sharedNodes.map((node, index) => renderSharedNode(node, 68 + index * 329)),
  rect(52, 1062, 1336, 148, '#f7faff', '#cdddf2', 8),
  logo('nova', 72, 1073, 50, 50),
  text(136, 1104, '추가 Compute 노드 8대', 25, { fill: palette.blue, weight: 700 }),
  text(1368, 1104, '각 노드에 Compute 1유닛 + OVN Chassis 1유닛', 20, { fill: palette.muted, anchor: 'end' }),
  ...additionalComputeNodes.map((node, index) => `${rect(76 + index * 160, 1141, 143, 51, '#fff', '#afc7e7', 5)}${text(147.5 + index * 160, 1174, node.label, 22, { fill: palette.blue, anchor: 'middle', weight: 600 })}`),
  rect(52, 1230, 1336, 136, '#fff', '#cdddf2', 8),
  text(76, 1268, 'Compute 11대 = 공유 그룹의 3대 + 추가 8대', 24, { fill: palette.blue, weight: 600 }),
  rect(76, 1288, 1288, 55, palette.blueFill, '#c9daf0', 5),
  text(98, 1324, '실행 중인 VM 102대', 25, { fill: palette.blue, weight: 700 }),
  text(1344, 1323, '스냅샷의 running_vms 기준', 19, { fill: palette.muted, anchor: 'end' }),
  logo('ceph', 48, 1410, 64, 58),
  text(130, 1431, 'Ceph OSD 4유닛 · OSD 데몬 15개', 22, { fill: palette.green, weight: 600 }),
  text(130, 1461, '4개 공유 노드에 OSD 유닛을 하나씩 배치', 19, { fill: palette.muted }),
  text(744, 1431, 'OVN Chassis 12유닛 / 상위 머신 11대', 22, { fill: palette.blue, weight: 600 }),
  text(744, 1461, 'Compute 11 + Octavia 1 — 같은 노드 공유', 19, { fill: palette.muted }),
  text(48, 1503, '실선: 배치 영역  ·  점선: 관리  ·  노드/LXD: 공개용 별칭', 17, { fill: palette.muted }),
  text(1392, 1503, `${openstackSnapshot.applications}앱 · ${openstackSnapshot.units}유닛 · MySQL Router ${openstackSnapshot.mysqlRouterUnits}유닛`, 17, { fill: palette.muted, anchor: 'end' }),
  '</svg>',
];

const svg = `${parts.join('\n')}\n`;
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, svg, 'utf8');
console.log(`Wrote public/architecture/openstack-deployment.svg (${width} × ${height}; 5 original brand assets embedded).`);

if (process.argv.includes('--preview')) {
  await mkdir(previewRoot, { recursive: true });
  const previewHtml = path.join(previewRoot, 'openstack-deployment.html');
  const previewPng = path.join(previewRoot, 'openstack-deployment.png');
  await writeFile(previewHtml, `<!doctype html><html lang="ko"><meta charset="utf-8"><title>OpenStack deployment preview</title><style>html,body{margin:0;width:${width}px;background:#fff}img{display:block;width:${width}px;height:${height}px}</style><img src="${pathToFileURL(outputPath).href}" alt="OpenStack deployment"></html>`, 'utf8');
  const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const args = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update', '--disable-extensions', '--disable-sync',
    '--hide-scrollbars', '--force-device-scale-factor=1', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=2500', '--proxy-server=http://127.0.0.1:9', '--proxy-bypass-list=<-loopback>',
    `--user-data-dir=${path.join(previewRoot, 'chrome-profile')}`,
    `--window-size=${width},${height + 100}`, `--screenshot=${previewPng}`, pathToFileURL(previewHtml).href,
  ];
  const result = spawnSync(chrome, args, { windowsHide: true, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0) {
    throw new Error(`Local Chrome preview failed: ${result.error?.message || `exit ${result.status}`}`);
  }
  console.log('Wrote PNG preview under workspace .local/openstack-architecture-preview/.');
}
