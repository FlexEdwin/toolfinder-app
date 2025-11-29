import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { KitProvider } from './context/KitContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CreateKit from './pages/CreateKit';
import Kits from './pages/Kits';

function App() {
  if (!localStorage.getItem('toolfinder_anon_id')) {
    localStorage.setItem('toolfinder_anon_id', crypto.randomUUID());
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <KitProvider> {/* <--- ENVOLVER AQUÍ */}
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<div>Login</div>} />
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