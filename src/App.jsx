import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Header from './components/Header/Header';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import SignUpForm from './components/Auth/SignUpForm';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;