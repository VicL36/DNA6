import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Response {
  created_at: string;
  audio_duration?: number;
}

interface AnalyticsChartProps {
  responses: Response[];
  isLoading: boolean;
}

export default function AnalyticsChart({ responses, isLoading }: AnalyticsChartProps) {
  // Group responses by day for the chart
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayResponses = responses.filter(r =>
        r.created_at.split('T')[0] === date
      );
     
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        responses: dayResponses.length,
        avgDuration: dayResponses.length > 0
          ? Math.round(dayResponses.reduce((acc, r) => acc + (r.audio_duration || 0), 0) / dayResponses.length)
          : 0
      };
    });
  };

  const chartData = getChartData();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-morphism border-0 shadow-glass">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-orange" />
            <span className="text-glow-orange">Atividade dos Últimos 7 Dias</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-pulse text-text-secondary">
                Carregando dados...
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#a0aec0' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#a0aec0' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#ffffff'
                  }}
                />
                <Bar
                  dataKey="responses"
                  fill="url(#gradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}