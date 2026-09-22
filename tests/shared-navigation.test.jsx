import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from '../src/App';
import '../src/layout/PortfolioRoutes';
import '../src/blog/BlogApplication';

// Exercise the actual shared navigation, route branches, portals and blog lifecycle.
// Fetching and detailed project contents have their own browser/content checks.
vi.mock('../src/components/Intro', () => ({ default: () => <h1>Portfolio home</h1> }));
vi.mock('../src/components/Profile', () => ({ default: () => <h1>Profile</h1> }));
vi.mock('../src/components/ChatWidget', () => ({ default: () => <div data-chat-widget /> }));
vi.mock('../src/components/Blog', () => ({ default: () => <h1>Blog list</h1> }));
vi.mock('../src/components/BlogDetail', () => ({ default: () => <h1>Blog article</h1> }));
vi.mock('../src/components/CreatePost', () => ({ default: () => <h1>Create article</h1> }));
vi.mock('../src/components/EditPost', () => ({ default: () => <h1>Edit article</h1> }));
vi.mock('../src/api/auth', () => ({ isAuthenticated: () => true, scheduleTokenRefresh: vi.fn(), restoreSession: vi.fn().mockResolvedValue(true) }));
vi.mock('../src/api/useAuth', () => ({ useAuth: () => ({ username: 'fixture-user', isAdmin: false }) }));

let container, root, navigate;
function NavigationHandle() { navigate = useNavigate(); return null; }
const trigger = () => document.getElementById('project-menu-trigger');

async function settleRoute() {
  for (let layer = 0; layer < 4; layer++) await act(async () => { await vi.dynamicImportSettled(); });
}
async function mount(path) {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><NavigationHandle /><App /></MemoryRouter>));
  await settleRoute();
  expect(container.querySelector('main h1')).not.toBeNull();
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', vi.fn(query => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('scrollTo', vi.fn());
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test.each([
  ['/blog', 'Blog list'], ['/blog/54', 'Blog article'],
  ['/blog/create', 'Create article'], ['/blog/edit/54', 'Edit article'],
])('the shared top navigation remains on %s with the blog selected', async (path, heading) => {
  await mount(path);
  expect(container.querySelector('main h1').textContent).toBe(heading);
  expect(document.querySelectorAll('.portfolio-header')).toHaveLength(1);
  expect(document.querySelectorAll('main')).toHaveLength(1);
  expect(document.querySelector('.portfolio-navigation a[href="/blog"]').getAttribute('aria-current')).toBe('page');
  expect(document.querySelector('.portfolio-navigation a[href="/profile"]')).not.toBeNull();
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  expect(document.querySelector('#portfolio-sidebar')).toBeNull();
  expect(document.body.classList.contains('blog-document')).toBe(true);
  expect(container.querySelectorAll('[data-chat-widget]')).toHaveLength(1);
  expect(document.querySelectorAll('a[href="#blog-main-content"]')).toHaveLength(1);
});

test('the project menu preserves the original project order and returns to the home content', async () => {
  await mount('/blog');
  trigger().focus();
  await act(async () => trigger().click());
  expect(trigger().getAttribute('aria-expanded')).toBe('true');
  expect([...document.querySelectorAll('#project-navigation a')].map(link => link.getAttribute('href'))).toEqual([
    '/', '/openstack', '/springboot', '/golang', '/kredis', '/opensearch', '/python', '/terraform', '/chrome', '/chatbot', '/redmine',
  ]);
  await act(async () => document.querySelector('#project-navigation a[href="/"]').click());
  await settleRoute();
  expect(container.querySelector('main h1').textContent).toBe('Portfolio home');
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  expect(document.body.classList.contains('blog-document')).toBe(false);
  expect(document.documentElement.classList.contains('blog-document')).toBe(false);
  expect(container.querySelector('[data-chat-widget]')).not.toBeNull();
  expect(document.activeElement).toBe(trigger());
});

test('the project menu opens with ArrowDown and Escape restores trigger focus', async () => {
  await mount('/');
  trigger().focus();
  await act(async () => trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
  expect(trigger().getAttribute('aria-expanded')).toBe('true');
  expect(document.querySelector('#project-navigation a[aria-current="page"]').getAttribute('href')).toBe('/');
  await act(async () => document.querySelector('#project-navigation').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(trigger().getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(trigger());
});

test('navigation persists between blog and profile while reader styles are released', async () => {
  await mount('/blog/54');
  const header = document.querySelector('.portfolio-header');
  await act(async () => navigate('/profile'));
  await settleRoute();
  expect(container.querySelector('main h1').textContent).toBe('Profile');
  expect(document.querySelector('.portfolio-header')).toBe(header);
  expect(document.querySelector('.portfolio-navigation a[href="/profile"]').getAttribute('aria-current')).toBe('page');
  expect(document.body.classList.contains('blog-document')).toBe(false);
  await act(async () => navigate('/blog'));
  await settleRoute();
  expect(container.querySelector('main h1').textContent).toBe('Blog list');
  expect(document.querySelector('.portfolio-header')).toBe(header);
  expect(document.body.classList.contains('blog-document')).toBe(true);
});

test.each([['/projects', 'Portfolio home'], ['/cicd', 'Blog article']])('the previous %s address still resolves', async (path, heading) => {
  await mount(path);
  expect(container.querySelector('main h1').textContent).toBe(heading);
});
