import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import SignConcepts from "./pages/SignConcepts";
import ContactPage from "./pages/ContactPage";
import TermsAndConditions from './components/TermsAndConditionsModal';
import KeyPointsPage from "./pages/KeyPointsPage";
import LearnSignPage from "./pages/learnsignpage.js";
import TextToSign from './pages/texttosign.js';
import SignToTextPage from './pages/SignToTextPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/sign-concepts" element={<SignConcepts />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/key-points" element={<KeyPointsPage />} />
          <Route path="/learn-sign" element={<LearnSignPage />} />
          <Route path="/text-to-sign" element={<TextToSign />} />
          <Route path="/sign-to-text" element={<SignToTextPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
