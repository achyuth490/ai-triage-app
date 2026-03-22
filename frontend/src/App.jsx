import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Report from './pages/Report'

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user ? children : <Navigate to="/login" />
}

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
    </Routes>
  )
}

export default App