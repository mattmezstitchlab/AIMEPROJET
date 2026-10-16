import SharedInformation from "./components/SharedInformation";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AimeProvider } from "./lib/store";
import Accueil from "./pages/Accueil";
import Bibliotheque from "./pages/Bibliotheque";
import StylesPage from "./pages/StylesPage";
import Grille from "./pages/Grille";
import Atelier from "./pages/Atelier";
import Specification from "./pages/Specification";
import Metamorphose from "./pages/Metamorphose";
import { lazy, Suspense } from "react";
const Landing = lazy(() => import("./pages/LivingDesk"));
const WeddingLanding = lazy(() => import("./pages/Landing"));
import Workspace from "./pages/Workspace";
import Poste from "./pages/Poste";
const People = lazy(() => import("./pages/People"));
const Profile = lazy(() => import("./pages/Profile"));
const Participations = lazy(() => import("./pages/Participations"));
const Templates = lazy(() => import("./pages/Templates"));
import Kits from "./pages/Kits";

export default function App() {
  return (
    <AimeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Suspense fallback={<p role="status" className="p-8">Chargement d’AIME…</p>}><Landing /></Suspense>} />
          <Route path="/univers/mariage" element={<Suspense fallback={<p role="status">Chargement…</p>}><WeddingLanding /></Suspense>} />
          <Route path="/espace" element={<Workspace />} />
          <Route path="/metamorphose" element={<Metamorphose />} />
          <Route
            path="*"
            element={
              <Shell>
                <Routes>
                  <Route path="/participations" element={<Suspense fallback={<p role="status" className="p-8">Chargement…</p>}><Participations /></Suspense>} />
                  <Route path="/personnes" element={<Suspense fallback={<p role="status" className="p-8">Chargement…</p>}><People /></Suspense>} />
                  <Route path="/personnes/:id" element={<Suspense fallback={<p role="status" className="p-8">Chargement…</p>}><Profile /></Suspense>} />
                  <Route path="/templates" element={<Suspense fallback={<p role="status" className="p-8">Chargement…</p>}><Templates /></Suspense>} />
                  <Route path="/poste" element={<Poste />} />
                  <Route path="/kits" element={<Kits />} />
                  <Route path="/informations" element={<SharedInformation />} />
                  <Route path="/vision" element={<Accueil />} />
                  <Route path="/bibliotheque" element={<Bibliotheque />} />
                  <Route path="/styles" element={<StylesPage />} />
                  <Route path="/grille" element={<Grille />} />
                  <Route path="/atelier" element={<Atelier />} />
                  <Route path="/specification" element={<Specification />} />
                  <Route path="*" element={<Accueil />} />
                </Routes>
              </Shell>
            }
          />
        </Routes>
      </BrowserRouter>
    </AimeProvider>
  );
}
