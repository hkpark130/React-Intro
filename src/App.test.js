import { render, screen } from '@testing-library/react';
import App from './App';

/*
-메뉴바 유닛테스트-

테스트 명령어: npm test
package.json에 ("scripts"->"test")
getAllByText: 여러개 표시될 때
getByText: 한 개일때
*/

test('intro 메뉴바 테스트', () => {
  render(<App />);
  const linkElement = screen.getAllByText(/Intro/);
  expect(linkElement[0]).toBeInTheDocument();
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
  const linkElement = screen.getAllByText(/Github/);
  expect(linkElement[0]).toBeInTheDocument();
});
