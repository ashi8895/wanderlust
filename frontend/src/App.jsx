import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import CreateListing from "./pages/CreateListing.jsx";
import EditListing from "./pages/EditListing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Trips from "./pages/Trips.jsx";

function PrivateRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <CreateListing />
            </PrivateRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <PrivateRoute>
              <EditListing />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <Trips />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
