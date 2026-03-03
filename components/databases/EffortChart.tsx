"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { listDailyTasksForEffort } from "@/services/dailyTaskService";
import type { DailyTask } from "@/types/models";

function getMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end, year, month };
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate();
}

function monthLabel(month: number, year: number) {
  const d = new Date(year, month);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

export function EffortChart() {
  const { workspaceId } = useWorkspaceContext();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { start, end, year, month } = useMemo(() => getMonthRange(), []);

  useEffect(() => {
    async function load() {
      if (!workspaceId) return;
      setIsLoading(true);
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const monthTasks = await listDailyTasksForEffort(workspaceId, startStr, endStr);
      setTasks(monthTasks);
      setIsLoading(false);
    }
    void load();
  }, [workspaceId, start, end]);

  const data = useMemo(() => {
    const daysInMonth = end.getDate();
    const today = new Date();
    const todayDay = today.getMonth() === month && today.getFullYear() === year
      ? today.getDate()
      : daysInMonth;

    const dayMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      dayMap.set(d, 0);
    }

    for (const task of tasks) {
      if (task.status === "done") {
        const day = formatDay(task.date);
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }
    }

    const points: { day: number; label: string; completed: number | null }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      points.push({
        day: d,
        label: `${d}`,
        completed: d <= todayDay ? (dayMap.get(d) || 0) : null,
      });
    }
    return points;
  }, [tasks, end, month, year]);

  const maxCompleted = Math.max(1, ...data.map((d) => d.completed ?? 0));

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="h-[140px] w-full bg-zinc-100 dark:bg-zinc-800/30 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
        Team Effort — {monthLabel(month, year)}
      </h2>
      <div className="h-[140px] sm:h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickMargin={6}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, maxCompleted + 1]}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs font-medium shadow-lg">
                    Day {d.day}: {d.completed ?? 0} completed
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="currentColor"
              className="text-zinc-900 dark:text-zinc-100"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, className: "fill-zinc-900 dark:fill-zinc-100" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
