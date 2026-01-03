import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage";
import AuthPage from "./pages/AuthPage";
import CreateConcernReport from "./pages/CreateConcernReport";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/form" element={<FormPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/concern-report" element={<CreateConcernReport />} />
        <Route path="/" element={<CreateConcernReport />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
