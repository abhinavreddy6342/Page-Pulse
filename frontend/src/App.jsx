import Home from "./pages/Home";
import ErrorBoundary from "./components/ErrorBoundary";
import ReportPage from "./pages/ReportPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  const path = window.location.pathname || '/';

  if (path === '/login') {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  if (path === '/register') {
    return (
      <ErrorBoundary>
        <Register />
      </ErrorBoundary>
    );
  }

  if (path === '/profile') {
    return (
      <ErrorBoundary>
        <Profile />
      </ErrorBoundary>
    );
  }

  if (path.startsWith('/report/')) {
    return (
      <ErrorBoundary>
        <ReportPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}

export default App;