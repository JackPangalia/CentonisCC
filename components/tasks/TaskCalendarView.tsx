"use client";

import { useState } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import type { Task } from "@/types/models";

type TaskCalendarViewProps = {
  tasks: Task[];
};

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
        <h3 className="font-semibold text-slate-800">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="rounded p-1 hover:bg-slate-200 text-slate-600">
            ←
          </button>
          <button onClick={nextMonth} className="rounded p-1 hover:bg-slate-200 text-slate-600">
            →
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[minmax(100px,_auto)] bg-slate-200 gap-px border-b border-slate-200">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasks.filter((t) => t.dueDate === dateKey);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toISOString()} 
              className={`bg-white p-2 min-h-[100px] flex flex-col gap-1 ${
                !isCurrentMonth ? "bg-slate-50/50 text-slate-400" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-blue-600 text-white" : ""
                }`}>
                  {format(day, "d")}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      task.status === 'done' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 line-through opacity-70' 
                        : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}
                    title={`${task.title}${task.tags && task.tags.length > 0 ? ` [${task.tags.join(', ')}]` : ''}`}
                  >
                    <div className="truncate">{task.title}</div>
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {task.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-200 text-emerald-800 px-1 rounded text-[8px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-[8px] text-slate-500">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
