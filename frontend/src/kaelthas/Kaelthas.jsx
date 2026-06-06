import { Routes, Route } from 'react-router-dom';
import './theme.module.css';
import styles from './kaelthas.module.css';
import { Header } from './header.jsx';
import { Hero } from './hero.jsx';
import { Features } from './features.jsx';
import { Journey } from './journey.jsx';
import { Footer } from './footer.jsx';
import { Cookies } from './cookies.jsx';
import { Frost } from './frost.jsx';

function LandingPage() {
  return (
    <div className={styles.page}>
      <Frost />
      <Header />
      <Hero />
      <Features />
      <Journey />
      <Footer />
      <Cookies />
    </div>
  );
}

export function Kaelthas() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
