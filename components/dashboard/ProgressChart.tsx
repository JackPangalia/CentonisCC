"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

type ProgressData = {
  date: string;
  completedTasks: number;
};

type ProgressChartProps = {
  data: ProgressData[];
};

export function ProgressChart({ data }: ProgressChartProps) {
  const { theme } = useTheme();

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <SpotlightCard className="col-span-1 md:col-span-3 h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">No progress data yet</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Complete tasks to see your velocity over time.</p>
        </div>
      </SpotlightCard>
    );
  }

  const isDark = theme === "dark";
  const strokeColor = isDark ? "#3b82f6" : "#2563eb"; // blue-500 / blue-600
  const fillColor = isDark ? "#1d4ed8" : "#93c5fd"; // blue-700 / blue-300

  return (
    <SpotlightCard className="col-span-1 md:col-span-3 h-[330px] p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>📈</span> Velocity
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Tasks completed over the last 7 days</p>
      </div>
      
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 18 }}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#27272a" : "#e4e4e7"}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#52525b" }}
              tickMargin={10}
              interval={0}
              padding={{ left: 12, right: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#52525b" }}
              width={30}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderRadius: "10px",
                fontSize: "12px",
                color: isDark ? "#f4f4f5" : "#18181b"
              }}
              itemStyle={{ color: strokeColor, fontWeight: 'bold' }}
              labelStyle={{ color: isDark ? "#d4d4d8" : "#3f3f46", fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="completedTasks" 
              name="Completed"
              stroke={strokeColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTasks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SpotlightCard>
  );
}