"use client";

import { useState, useMemo } from "react";
import {
  getJalaaliToday,
  getJalaaliMonthDays,
  getPersianWeekDay,
  jalaaliDateString,
  parseJalaaliString,
  toPersianDigits,
  persianWeekDays,
  persianMonths,
} from "@/lib/jalali";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClose?: () => void;
}

export default function JalaliDatePicker({ value, onChange, onClose }: Props) {
  const today = getJalaaliToday();
  const parsed = parseJalaaliString(value);

  const [viewYear, setViewYear] = useState(parsed?.jy ?? today.jy);
  const [viewMonth, setViewMonth] = useState(parsed?.jm ?? today.jm);

  const selectedDate = parsed;

  const daysInMonth = useMemo(
    () => getJalaaliMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const firstDayWeekDay = useMemo(
    () => getPersianWeekDay(viewYear, viewMonth, 1),
    [viewYear, viewMonth]
  );

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const dateStr = jalaaliDateString(viewYear, viewMonth, day);
    onChange(dateStr);
    onClose?.();
  };

  const isToday = (day: number) =>
    viewYear === today.jy && viewMonth === today.jm && day === today.jd;

  const isSelected = (day: number) =>
    selectedDate &&
    viewYear === selectedDate.jy &&
    viewMonth === selectedDate.jm &&
    day === selectedDate.jd;

  const blanks = Array.from({ length: firstDayWeekDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-4 w-[300px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
        >
          ❯
        </button>
        <div className="text-sm font-bold text-slate-800">
          {persianMonths[viewMonth - 1]} {toPersianDigits(String(viewYear))}
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
        >
          ❮
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {persianWeekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} />
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => selectDay(day)}
            className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer
              ${isSelected(day) ? "bg-primary text-white font-bold shadow-md" : ""}
              ${isToday(day) && !isSelected(day) ? "border-2 border-primary text-primary font-bold" : ""}
              ${!isSelected(day) && !isToday(day) ? "hover:bg-indigo-50 text-slate-700" : ""}
            `}
          >
            {toPersianDigits(String(day))}
          </button>
        ))}
      </div>

      {/* Today button */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => {
            setViewYear(today.jy);
            setViewMonth(today.jm);
            selectDay(today.jd);
          }}
          className="text-xs text-primary hover:text-primary-dark font-medium px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          امروز
        </button>
      </div>
    </div>
  );
}
