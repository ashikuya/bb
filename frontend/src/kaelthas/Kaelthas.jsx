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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:slug" element={<ForumCategoryPage />} />
        <Route path="/forum/:slug/:threadId" element={<ForumThreadPage />} />
      </Routes>
    </AuthProvider>
  );
}
