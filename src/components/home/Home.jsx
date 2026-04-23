import React from 'react';
import Hero from './Hero';
import SelectedWork from './SelectedWork';
import RecentWriting from './RecentWriting';
import Contact from './Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <RecentWriting />
      <Contact />
    </>
  );
}
