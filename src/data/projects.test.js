import { describe, it, expect } from 'vitest';
import { PROJECTS, getFeaturedProjects, getProjectsByTag } from './projects';

describe('projects data', () => {
  it('has 10 projects', () => {
    expect(PROJECTS.length).toBe(10);
  });

  it('every project has required fields', () => {
    for (const p of PROJECTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.path).toMatch(/^\/[a-z]+/);
      expect(p.description).toBeTruthy();
      expect(Array.isArray(p.stack)).toBe(true);
      expect(Array.isArray(p.tags)).toBe(true);
    }
  });

  it('slug is unique', () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.size).toBe(PROJECTS.length);
  });

  it('getFeaturedProjects returns exactly those with featured=true', () => {
    const featured = getFeaturedProjects();
    expect(featured.every((p) => p.featured === true)).toBe(true);
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThanOrEqual(4);
  });

  it('getProjectsByTag filters correctly', () => {
    const devops = getProjectsByTag('devops');
    expect(devops.every((p) => p.tags.includes('devops'))).toBe(true);
  });
});
