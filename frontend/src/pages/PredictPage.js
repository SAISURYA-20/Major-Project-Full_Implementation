import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PredictPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualData, setManualData] = useState({
    ebitdaMargins: 0.35,
    profitMargins: 0.25,
    grossMargins: 0.43,
    operatingCashflow: 50000000,
    revenueGrowth: 0.12,
    operatingMargins: 0.30,
    ebitda: 100000000,
    grossProfits: 150000000,
    freeCashflow: 40000000,
    currentPrice: 150.0,
    earningsGrowth: 0.08,
    currentRatio: 1.8,
    returnOnAssets: 0.15,
    debtToEquity: 0.5,
    returnOnEquity: 0.30,
    totalCash: 80000000,
    totalDebt: 30000000,
    totalRevenue: 500000000,
    totalCashPerShare: 15.0,
    revenuePerShare: 95.0,
    quickRatio: 0.9,
    enterpriseToRevenue: 5.0,
    enterpriseToEbitda: 12.0,
    forwardEps: 8.5,
    sharesOutstanding: 5000000,
    bookValue: 100.0,
    trailingEps: 7.8,
    priceToBook: 45.0,
    heldPercentInsiders: 0.05,
    enterpriseValue: 2500000000,
    earningsQuarterlyGrowth: 0.10,
    pegRatio: 2.8,
    forwardPE: 28.0,
    marketCap: 750000000,
    industry: "Technology"
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handlePredict = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/predict`, { company: selectedCompany });
      setPrediction(response.data);
    } catch (error) {
      console.error("Error predicting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/predict-manual`, manualData);
      // Update company name in response to show "Manual Input" with industry
      const updatedResponse = {
        ...response.data,
        company: `${manualData.industry} Company (Manual Input)`
      };
      setPrediction(updatedResponse);
    } catch (error) {
      console.error("Error predicting:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = prediction ? {
    labels: ['Growth', 'Value', 'Stable', 'Speculative'],
    datasets: [
      {
        label: 'Probability',
        data: [
          prediction.regime.probabilities.Growth,
          prediction.regime.probabilities.Value,
          prediction.regime.probabilities.Stable,
          prediction.regime.probabilities.Speculative,
        ],
        backgroundColor: ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b'],
      },
    ],
  } : null;

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
      y: {
        grid: { color: '#374151', borderColor: '#1f2937' },
        ticks: { color: '#9ca3af', font: { family: 'DM Mono' } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Financial Prediction</h1>
        <p className="text-muted-foreground">Predict financial distress and investment regime classification</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted" data-testid="predict-tabs">
          <TabsTrigger value="company" data-testid="company-tab">Search by Company</TabsTrigger>
          <TabsTrigger value="manual" data-testid="manual-tab">Manual Input</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-select">Select Company</Label>
                <Select onValueChange={setSelectedCompany} data-testid="company-select">
                  <SelectTrigger className="w-full mt-2 bg-input border-border">
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {companies.map((company) => (
                      <SelectItem key={company.company} value={company.company} className="hover:bg-muted">
                        {company.company} ({company.industry})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePredict} disabled={!selectedCompany || loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="predict-button">
                {loading ? "Analyzing..." : "Predict"}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">Enter Financial Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="industry" className="text-sm">Industry *</Label>
                <Input id="industry" type="text" value={manualData.industry} onChange={(e) => setManualData({...manualData, industry: e.target.value})} className="mt-1 bg-input border-border" placeholder="e.g., Technology" />
              </div>
              
              <div>
                <Label htmlFor="revenueGrowth" className="text-sm">Revenue Growth</Label>
                <Input id="revenueGrowth" type="number" step="0.01" value={manualData.revenueGrowth} onChange={(e) => setManualData({...manualData, revenueGrowth: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="earningsGrowth" className="text-sm">Earnings Growth</Label>
                <Input id="earningsGrowth" type="number" step="0.01" value={manualData.earningsGrowth} onChange={(e) => setManualData({...manualData, earningsGrowth: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="profitMargins" className="text-sm">Profit Margins</Label>
                <Input id="profitMargins" type="number" step="0.01" value={manualData.profitMargins} onChange={(e) => setManualData({...manualData, profitMargins: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="grossMargins" className="text-sm">Gross Margins</Label>
                <Input id="grossMargins" type="number" step="0.01" value={manualData.grossMargins} onChange={(e) => setManualData({...manualData, grossMargins: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="operatingMargins" className="text-sm">Operating Margins</Label>
                <Input id="operatingMargins" type="number" step="0.01" value={manualData.operatingMargins} onChange={(e) => setManualData({...manualData, operatingMargins: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="ebitdaMargins" className="text-sm">EBITDA Margins</Label>
                <Input id="ebitdaMargins" type="number" step="0.01" value={manualData.ebitdaMargins} onChange={(e) => setManualData({...manualData, ebitdaMargins: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="returnOnAssets" className="text-sm">Return on Assets (ROA)</Label>
                <Input id="returnOnAssets" type="number" step="0.01" value={manualData.returnOnAssets} onChange={(e) => setManualData({...manualData, returnOnAssets: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="returnOnEquity" className="text-sm">Return on Equity (ROE)</Label>
                <Input id="returnOnEquity" type="number" step="0.01" value={manualData.returnOnEquity} onChange={(e) => setManualData({...manualData, returnOnEquity: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="debtToEquity" className="text-sm">Debt to Equity</Label>
                <Input id="debtToEquity" type="number" step="0.1" value={manualData.debtToEquity} onChange={(e) => setManualData({...manualData, debtToEquity: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="currentRatio" className="text-sm">Current Ratio</Label>
                <Input id="currentRatio" type="number" step="0.1" value={manualData.currentRatio} onChange={(e) => setManualData({...manualData, currentRatio: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="quickRatio" className="text-sm">Quick Ratio</Label>
                <Input id="quickRatio" type="number" step="0.1" value={manualData.quickRatio} onChange={(e) => setManualData({...manualData, quickRatio: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="priceToBook" className="text-sm">Price to Book</Label>
                <Input id="priceToBook" type="number" step="1" value={manualData.priceToBook} onChange={(e) => setManualData({...manualData, priceToBook: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="forwardPE" className="text-sm">Forward P/E</Label>
                <Input id="forwardPE" type="number" step="1" value={manualData.forwardPE} onChange={(e) => setManualData({...manualData, forwardPE: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="pegRatio" className="text-sm">PEG Ratio</Label>
                <Input id="pegRatio" type="number" step="0.1" value={manualData.pegRatio} onChange={(e) => setManualData({...manualData, pegRatio: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="totalRevenue" className="text-sm">Total Revenue</Label>
                <Input id="totalRevenue" type="number" step="1000000" value={manualData.totalRevenue} onChange={(e) => setManualData({...manualData, totalRevenue: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="totalDebt" className="text-sm">Total Debt</Label>
                <Input id="totalDebt" type="number" step="1000000" value={manualData.totalDebt} onChange={(e) => setManualData({...manualData, totalDebt: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="totalCash" className="text-sm">Total Cash</Label>
                <Input id="totalCash" type="number" step="1000000" value={manualData.totalCash} onChange={(e) => setManualData({...manualData, totalCash: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="marketCap" className="text-sm">Market Cap</Label>
                <Input id="marketCap" type="number" step="1000000" value={manualData.marketCap} onChange={(e) => setManualData({...manualData, marketCap: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="freeCashflow" className="text-sm">Free Cashflow</Label>
                <Input id="freeCashflow" type="number" step="1000000" value={manualData.freeCashflow} onChange={(e) => setManualData({...manualData, freeCashflow: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
              
              <div>
                <Label htmlFor="operatingCashflow" className="text-sm">Operating Cashflow</Label>
                <Input id="operatingCashflow" type="number" step="1000000" value={manualData.operatingCashflow} onChange={(e) => setManualData({...manualData, operatingCashflow: parseFloat(e.target.value) || 0})} className="mt-1 bg-input border-border" />
              </div>
            </div>
            <Button onClick={handleManualPredict} disabled={loading} className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="manual-predict-button">
              {loading ? "Analyzing..." : "Predict from Manual Data"}
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Prediction Results */}
      {prediction && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" data-testid="prediction-results">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="font-heading text-2xl font-semibold">{prediction.company}</h2>
                <p className="text-sm text-muted-foreground mt-1">{prediction.industry}</p>
              </div>
            </div>
            
            <h3 className="font-heading text-xl font-semibold mb-4">Prediction Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distress Prediction */}
              <div className={`p-6 rounded-lg border-2 ${
                prediction.distress.label === "Distressed" ? "border-destructive bg-destructive/5" : "border-success bg-success/5"
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {prediction.distress.label === "Distressed" ? (
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-success" />
                  )}
                  <div>
                    <h3 className="font-heading font-semibold text-lg">Financial Distress</h3>
                    <p className={`font-mono text-2xl font-bold ${
                      prediction.distress.label === "Distressed" ? "text-destructive" : "text-success"
                    }`}>
                      {prediction.distress.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Probability</span>
                    <span className="font-mono font-semibold">{(prediction.distress.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                      prediction.distress.label === "Distressed" ? "bg-destructive" : "bg-success"
                    }`} style={{ width: `${prediction.distress.probability * 100}%` }} />
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <p className="font-mono font-semibold">{prediction.distress.risk_level}</p>
                  </div>
                </div>
              </div>

              {/* Regime Classification */}
              <div className="p-6 rounded-lg border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-heading font-semibold text-lg">Investment Regime</h3>
                    <p className="font-mono text-2xl font-bold text-primary">{prediction.regime.label}</p>
                  </div>
                </div>
                <div className="h-48">
                  {chartData && <Bar data={chartData} options={chartOptions} />}
                </div>
              </div>
            </div>

            {/* Top Features */}
            <div className="mt-6">
              <h3 className="font-heading font-semibold mb-3">Top Contributing Features</h3>
              <div className="space-y-2">
                {prediction.top_features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">{feature.feature}</span>
                    <span className="font-mono text-sm font-semibold text-primary">{feature.value.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PredictPage;
