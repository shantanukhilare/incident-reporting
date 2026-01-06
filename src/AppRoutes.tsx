import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CreateConcernReport from "./pages/CreateConcernReport";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/concern-report" element={<CreateConcernReport />} />
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
