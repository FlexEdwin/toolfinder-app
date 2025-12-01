import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { KitProvider } from './context/KitContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CreateKit from './pages/CreateKit';
import Kits from './pages/Kits';
import Login from './pages/Login';
import SystemAnnouncement from './components/SystemAnnouncement';

function App() {
  if (!localStorage.getItem('toolfinder_anon_id')) {
    localStorage.setItem('toolfinder_anon_id', crypto.randomUUID());
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <KitProvider>
          <SystemAnnouncement />
          <Toaster position="bottom-right" richColors />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={
                <ProtectedRoute redirectIfAuth={true}>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="kits" element={<Kits />} />
              <Route path="create" element={<CreateKit />} />
            </Route>
          </Routes>
        </KitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;