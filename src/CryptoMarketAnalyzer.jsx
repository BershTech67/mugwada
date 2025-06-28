
import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader,
  Info,
} from "lucide-react";
import "tailwindcss/tailwind.css";

const getStatusIcon = (score) => {
  if (score > 75) return <CheckCircle className="text-green-400" />;
  if (score >= 40) return <Info className="text-yellow-400" />;
  return <XCircle className="text-red-400" />;
};

const getStatusText = (score) => {
  if (score > 75) return "Excellent";
  if (score >= 40) return "Good";
  return "Poor";
};

const formatPercentage = (val) => `${parseFloat(val).toFixed(2)}%`;

const analyzeStrategy = (inputs, type) => {
  const volatilityScore = Math.abs(inputs.volumeChange) < 10 ? 30 : 10;
  const dominanceScore = type === "scalping" ? 20 - inputs.btcDominance * 0.1 : 15;
  const sentimentScore = inputs.sentiment > 50 ? 30 : 10;
  const volumeScore = inputs.totalVolume > 10000000000 ? 40 : 20;
  const baseScore = volatilityScore + dominanceScore + sentimentScore + volumeScore;

  let recommendation = [];
  let riskFactors = [];
  let bestPairs = [];

  if (type === "scalping") {
    recommendation = ["Use tight stop losses", "Focus on BTC/USDT"];
    riskFactors = ["High volatility", "Slippage"];
    bestPairs = ["BTC/USDT", "ETH/USDT"];
  } else if (type === "day") {
    recommendation = ["Follow trendlines", "Use volume confirmation"];
    riskFactors = ["Mid-term reversals"];
    bestPairs = ["ETH/USDT", "SOL/USDT"];
  } else {
    recommendation = ["Hold positions 1-7 days", "Focus on macro trend"];
    riskFactors = ["Unexpected news"];
    bestPairs = ["ADA/USDT", "AVAX/USDT"];
  }

  return {
    score: baseScore,
    status: getStatusText(baseScore),
    recommendation,
    riskFactors,
    bestPairs,
  };
};

export default function CryptoMarketAnalyzer() {
  const [inputs, setInputs] = useState({
    totalCap: 0,
    capChange: 0,
    totalVolume: 0,
    volumeChange: 0,
    btcDominance: 0,
    ethDominance: 0,
    sentiment: 50,
    activeCoins: 0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseFloat(value) });
  };

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      const scalping = analyzeStrategy(inputs, "scalping");
      const day = analyzeStrategy(inputs, "day");
      const swing = analyzeStrategy(inputs, "swing");
      const overall = (scalping.score + day.score + swing.score) / 3;
      setResult({ scalping, day, swing, overall });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="w-full md:w-1/2 p-4 space-y-4">
        <h2 className="text-xl font-bold">Market Inputs</h2>
        {Object.keys(inputs).map((key) => (
          <input
            key={key}
            name={key}
            type="number"
            step="any"
            placeholder={key}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        ))}
        <button
          onClick={handleAnalyze}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Analyze Market
        </button>
        <div className="text-sm text-gray-400">
          <strong>Disclaimer:</strong> This tool is for educational purposes. Always do your own research.
        </div>
        <div className="text-xs italic mt-2">Guide: Enter accurate data to get strategy suggestions based on real market metrics.</div>
      </div>

      <div className="w-full md:w-1/2 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full animate-pulse">
            <Loader className="w-16 h-16 text-blue-400 animate-spin" />
            <p className="mt-4 text-lg">Analyzing market data...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="text-center text-2xl font-semibold">Overall Market Condition</div>
            <div className="bg-gray-700 p-4 rounded shadow-xl">
              <div className="text-lg">Score: {Math.round(result.overall)}</div>
              <div>Status: {getStatusText(result.overall)}</div>
            </div>

            {Object.entries(result).map(([key, data]) => {
              if (key === "overall") return null;
              return (
                <div key={key} className="bg-gray-800 p-4 rounded shadow-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl capitalize">{key} Strategy</h3>
                    {getStatusIcon(data.score)}
                  </div>
                  <div className="mt-2">Score: <span className="text-blue-400 font-semibold">{Math.round(data.score)}</span></div>
                  <div>Status: {data.status}</div>
                  <div>Recommendations: {data.recommendation.join(", ")}</div>
                  <div>Risk Factors: {data.riskFactors.join(", ")}</div>
                  <div>Best Trading Pairs: {data.bestPairs.join(", ")}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400">Enter data and click Analyze to begin.</div>
        )}
      </div>
    </div>
  );
}
