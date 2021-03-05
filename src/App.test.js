import { render, screen } from '@testing-library/react';
import App from './App';

/*
메뉴바 유닛테스트
npm test
package.json에 「"scripts"->"test"」
*/

test('intro 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Intro/);
  expect(linkElement).toBeInTheDocument();
});

test('Spring 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Spring/);
  expect(linkElement).toBeInTheDocument();
});

test('Kotlin 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Kotlin/);
  expect(linkElement).toBeInTheDocument();
});

test('python 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Python/);
  expect(linkElement).toBeInTheDocument();
});

test('Redmine 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Redmine/);
  expect(linkElement).toBeInTheDocument();
});

test('Github 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getByText(/Github/);
  expect(linkElement).toBeInTheDocument();
});
