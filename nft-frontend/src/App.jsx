import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import MintPage from "./pages/MintPage";
import GalleryPage from "./pages/GalleryPage";
import ExplorePage from "./pages/ExplorePage";

function App() {
  return (
    <WalletProvider>
      <Router>
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/mint" element={<MintPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/explore" element={<ExplorePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
