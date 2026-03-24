import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

ChartJS.register(ArcElement, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DatasetPage = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, companiesRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/companies`)
      ]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data.companies);
    } catch (error) {
      console.error("Error fetching dataset:", error);
    }
  };

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(companies.length / companiesPerPage);

  const regimeChartData = stats ? {
    labels: ['Growth', 'Value', 'Stable', 'Speculative'],
    datasets: [
      {
        data: [
          stats.regime_distribution.Growth,
          stats.regime_distribution.Value,
          stats.regime_distribution.Stable,
          stats.regime_distribution.Speculative,
        ],
        backgroundColor: ['#5dd3b3', '#6eb5ff', '#d3d3d3', '#ffd966'],
        borderWidth: 2,
        borderColor: '#111827',
      },
    ],
  } : null;

  const distressChartData = stats ? {
    labels: ['Healthy', 'Distressed'],
    datasets: [
      {
        data: [stats.not_distressed_count, stats.distressed_count],
        backgroundColor: ['#ff6b9d', '#daa520'],
        borderWidth: 2,
        borderColor: '#111827',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#9ca3af', font: { family: 'DM Mono' }, padding: 15 },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Dataset Explorer</h1>
        <p className="text-muted-foreground">Comprehensive view of the financial dataset</p>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="dataset-summary">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
            <p className="text-3xl font-mono font-bold text-primary">{stats.total_companies}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Industries</p>
            <p className="text-3xl font-mono font-bold text-secondary">{stats.total_industries}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Features</p>
            <p className="text-3xl font-mono font-bold text-success">{stats.total_features}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">Distressed</p>
            <p className="text-3xl font-mono font-bold text-destructive">{stats.distressed_count}</p>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regimeChartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-lg p-6" data-testid="regime-chart">
            <h2 className="font-heading text-xl font-semibold mb-4">Regime Distribution</h2>
            <div className="h-64">
              <Pie data={regimeChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
        {distressChartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-lg p-6" data-testid="distress-chart">
            <h2 className="font-heading text-xl font-semibold mb-4">Distress Distribution</h2>
            <div className="h-64">
              <Doughnut data={distressChartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Companies Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-card border border-border rounded-lg p-6" data-testid="companies-table">
        <h2 className="font-heading text-xl font-semibold mb-4">Companies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-heading font-semibold">Company</th>
                <th className="text-left py-3 px-4 font-heading font-semibold">Industry</th>
                <th className="text-left py-3 px-4 font-heading font-semibold">Revenue Growth</th>
                <th className="text-left py-3 px-4 font-heading font-semibold">Profit Margins</th>
                <th className="text-left py-3 px-4 font-heading font-semibold">Debt/Equity</th>
              </tr>
            </thead>
            <tbody>
              {currentCompanies.map((company, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4 font-medium">{company.company}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{company.industry}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className={company.revenueGrowth > 0 ? "text-success" : "text-destructive"}>
                      {(company.revenueGrowth * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className={company.profitMargins > 0 ? "text-success" : "text-destructive"}>
                      {(company.profitMargins * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">{company.debtToEquity.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, companies.length)} of {companies.length} companies
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="bg-input border-border"
              data-testid="prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 bg-muted rounded-md text-sm font-mono">
              {currentPage} / {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="bg-input border-border"
              data-testid="next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetPage;
