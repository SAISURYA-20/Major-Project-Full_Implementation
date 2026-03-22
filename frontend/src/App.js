import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import PredictPage from "@/pages/PredictPage";
import PerformancePage from "@/pages/PerformancePage";
import FeaturesPage from "@/pages/FeaturesPage";
import DatasetPage from "@/pages/DatasetPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AboutPage from "@/pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
