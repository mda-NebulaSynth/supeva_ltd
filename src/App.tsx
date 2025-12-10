import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AboutPage } from './pages/AboutPage';
import { TeamPage } from './pages/TeamPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProjectsManager } from './pages/admin/ProjectsManager';
import { BlogManager } from './pages/admin/BlogManager';
import { TeamManager } from './pages/admin/TeamManager';
import { BannersManager } from './pages/admin/BannersManager';
import { TestimonialsManager } from './pages/admin/TestimonialsManager';
import { ContactsManager } from './pages/admin/ContactsManager';
import { ProjectUpdatesManager } from './pages/admin/ProjectUpdatesManager';
import { SetupPasswordPage } from './pages/SetupPasswordPage';

// Placeholder pages - to be implemented
const NotFoundPage = () => <div className="section container-custom text-center"><h1 className="text-6xl font-bold text-primary-600">404</h1><p className="mt-4 text-xl">Page not found</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth Routes (No Layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/projects" element={<ProjectsManager />} />
              <Route path="/admin/blog" element={<BlogManager />} />
              <Route path="/admin/team" element={<TeamManager />} />
              <Route path="/admin/ads" element={<BannersManager />} />
              <Route path="/admin/testimonials" element={<TestimonialsManager />} />
              <Route path="/admin/contacts" element={<ContactsManager />} />
              <Route path="/admin/project-updates" element={<ProjectUpdatesManager />} />

              {/* Founder-only route */}
              <Route
                path="/admin/team-management"
                element={
                  <ProtectedRoute requireFounder={true}>
                    {/* <TeamManagement /> */}
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
