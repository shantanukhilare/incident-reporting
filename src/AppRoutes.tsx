import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import CreateConcernReport from "./pages/CreateConcernReport";
import ConcernReportingChatBot_claude from "./pages/ConcernReportingChatBot_claude";
import ConcernReportingChatBot_gemini from "./pages/ConcernReportingChatBot_gemini";
import ConcernReportingChatBot_lib from "./pages/ConcernReportingChatBot_lib";
import ConcernReportingForm from "./pages/ConcernReportingForm";

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
        <Route path="/v3" element={<ConcernReportingChatBot_lib />} />
        <Route path="/v4" element={<ConcernReportingForm />} />
        <Route path="/" element={<ConcernReportingForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
