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
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      title: "Sessões Completas",
      value: stats.completedSessions,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100"
    },
    {
      title: "Respostas Gravadas",
      value: stats.totalResponses,
      icon: Mic,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    },
    {
      title: "Tempo Médio",
      value: `${stats.avgResponseTime}s`,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100"
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
          <Card className={`overflow-hidden border-0 shadow-lg bg-gradient-to-br ${item.bgColor} hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {item.title}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">
                      {item.value}
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}>
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