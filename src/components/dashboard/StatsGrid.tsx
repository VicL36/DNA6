import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  CheckCircle,
  Mic,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  stats: {
    totalSessions: number;
    completedSessions: number;
    totalResponses: number;
    avgResponseTime: number;
  };
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const statItems = [
    {
      title: "Total de Sessões",
      value: stats.totalSessions,
      icon: Brain,
      gradient: "from-neon-blue to-blue-400",
      glow: "neon-blue"
    },
    {
      title: "Sessões Completas",
      value: stats.completedSessions,
      icon: CheckCircle,
      gradient: "from-green-400 to-emerald-500",
      glow: "neon-blue"
    },
    {
      title: "Respostas Gravadas",
      value: stats.totalResponses,
      icon: Mic,
      gradient: "from-purple-500 to-pink-500",
      glow: "neon-orange"
    },
    {
      title: "Tempo Médio",
      value: `${stats.avgResponseTime}s`,
      icon: Clock,
      gradient: "from-neon-orange to-yellow-500",
      glow: "neon-orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`glass-morphism border-0 shadow-glass card-hover overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">
                    {item.title}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-dark-surface" />
                  ) : (
                    <p className="text-3xl font-bold text-text-primary">
                      {item.value}
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center shadow-${item.glow}`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}