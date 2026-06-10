import { Routes, Route } from 'react-router-dom';
import './theme.module.css';
import styles from './kaelthas.module.css';
import { AuthProvider } from './auth-context.jsx';
import { Header } from './header.jsx';
import { Hero } from './hero.jsx';
import { Features } from './features.jsx';
import { Journey } from './journey.jsx';
import { Footer } from './footer.jsx';
import { Cookies } from './cookies.jsx';
import { Frost } from './frost.jsx';
import { LoginPage } from './login-page.jsx';
import { RegisterPage } from './register-page.jsx';
import { AccountPage } from './account-page.jsx';
import { ForumPage } from './forum-page.jsx';
import { ForumCategoryPage } from './forum-category-page.jsx';
import { ForumThreadPage } from './forum-thread-page.jsx';
import { AdminPage } from './admin-page.jsx';

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

function SubPageBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.55) saturate(1.05)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background:
            'radial-gradient(ellipse 90% 80% at 50% 35%, rgba(5,9,18,0.45) 0%, rgba(5,9,18,0.8) 60%, rgba(5,9,18,0.95) 100%), linear-gradient(180deg, rgba(5,9,18,0.65), rgba(5,9,18,0.92))',
        }}
      />
    </>
  );
}

export function Kaelthas() {
  return (
    <AuthProvider>
      <SubPageBackdrop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:slug" element={<ForumCategoryPage />} />
        <Route path="/forum/:slug/:threadId" element={<ForumThreadPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AuthProvider>
  );
}
