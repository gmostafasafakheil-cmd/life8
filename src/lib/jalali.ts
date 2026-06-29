import * as jalaali from "jalaali-js";

export function toJalaali(date: Date): { jy: number; jm: number; jd: number } {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function toGregorian(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function formatJalaaliDate(date: Date): string {
  const { jy, jm, jd } = toJalaali(date);
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function toPersianDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

export function formatJalaaliPersian(date: Date): string {
  const { jy, jm, jd } = toJalaali(date);
  const months = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
  ];
  return toPersianDigits(`${jd} ${months[jm - 1]} ${jy}`);
}

export function getJalaaliMonthDays(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

export function getJalaaliToday(): { jy: number; jm: number; jd: number } {
  return toJalaali(new Date());
}

export function getWeekDay(jy: number, jm: number, jd: number): number {
  const gDate = toGregorian(jy, jm, jd);
  return gDate.getDay();
}

export function getPersianWeekDay(jy: number, jm: number, jd: number): number {
  const day = getWeekDay(jy, jm, jd);
  return (day + 1) % 7;
}

export function jalaaliDateString(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export function parseJalaaliString(str: string): { jy: number; jm: number; jd: number } | null {
  if (!str) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  return { jy: parseInt(parts[0]), jm: parseInt(parts[1]), jd: parseInt(parts[2]) };
}

export const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
export const persianWeekDaysFull = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
export const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function getPersianWeekDayName(date: Date): string {
  const day = date.getDay(); // 0=Sun
  const persianIndex = (day + 1) % 7; // Sat=0
  return persianWeekDaysFull[persianIndex];
}
