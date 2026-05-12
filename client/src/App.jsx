import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Vehicles from './pages/Vehicles';
import Policies from './pages/Policies';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppProvider>
                  <div className="app-layout">
                    <Sidebar />
                    <div className="main-area">
                      <Header />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/clients/:id" element={<ClientDetail />} />
                          <Route path="/vehicles" element={<Vehicles />} />
                          <Route path="/policies" element={<Policies />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          {/* Catch all for dashboard */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </AppProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
