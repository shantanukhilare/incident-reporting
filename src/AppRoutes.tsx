import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CreateConcernReport from "./pages/CreateConcernReport";
import ConcernReportingChatBot_claude from "./pages/ConcernReportingChatBot_claude";
import ConcernReportingChatBot_gemini from "./pages/ConcernReportingChatBot_gemini";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/concern-report" element={<CreateConcernReport />} />
        {/* <Route path="/" element={<AuthPage />} /> */}
        {/* <Route path="/chatbot" element={<ConcernReportingChatbot />} /> */}
        <Route path="/v1" element={<ConcernReportingChatBot_claude />} />
        <Route path="/v2" element={<ConcernReportingChatBot_gemini />} />
        <Route path="/" element={<ConcernReportingChatBot_gemini />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
