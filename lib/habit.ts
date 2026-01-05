import { Droplets, Apple, Activity, Moon, Smartphone } from "lucide-react";
import {
  Habit,
  EncouragementMessages,
  EncouragementLevel,
  DailyCheckin,
} from "../types";

export const AVAILABLE_HABITS: Habit[] = [
  {
    key: "water",
    name: "Water Intake",
    description: "Stay hydrated throughout the day",
    icon: Droplets,
    color: "#5FB3B3",
    trackingType: "boolean",
  },
  {
    key: "fruits_veggies",
    name: "Fruits & Vegetables",
    description: "Eat colorful, nutritious foods",
    icon: Apple,
    color: "#8BAA8C",
    trackingType: "boolean",
  },
  {
    key: "physical_activity",
    name: "Physical Activity",
    description: "Move your body in any way",
    icon: Activity,
    color: "#F5A97F",
    trackingType: "boolean",
  },
  {
    key: "sleep_quality",
    name: "Quality Sleep",
    description: "Rest well and wake refreshed",
    icon: Moon,
    color: "#B4A7D6",
    trackingType: "scale",
    scaleLabels: ["Poor", "Fair", "Good", "Great", "Excellent"],
  },
  {
    key: "screen_free",
    name: "Screen-Free Time",
    description: "Take breaks from devices",
    icon: Smartphone,
    color: "#B8C5D0",
    trackingType: "boolean",
  },
];

export const ENCOURAGEMENT_MESSAGES: EncouragementMessages = {
  high_consistency: [
    "You're building something real here. Keep going.",
    "Small steps, repeated daily. That's the secret.",
    "Your consistency is inspiring. Well done.",
    "You're showing up. That's what matters most.",
  ],
  medium_consistency: [
    "Progress isn't perfection. You're doing great.",
    "Every step counts, even the small ones.",
    "You're learning what works for you. That's progress.",
    "Keep going. You're building a healthier rhythm.",
  ],
  low_consistency: [
    "Starting fresh is always an option. No judgment.",
    "Life happens. What matters is coming back.",
    "Small actions today add up tomorrow.",
    "You're here. That's the first step.",
  ],
  missed_day: [
    "One day doesn't define your journey.",
    "Tomorrow is a new opportunity.",
    "Be kind to yourself. Progress isn't linear.",
  ],
};

export const calculateConsistency = (
  checkins: DailyCheckin[],
  daysInPeriod: number
): number => {
  if (!checkins || checkins.length === 0) return 0;
  const completedDays = checkins.filter((c) => c.completed).length;
  return Math.round((completedDays / daysInPeriod) * 100);
};

export const getEncouragementLevel = (
  consistencyPercentage: number
): EncouragementLevel => {
  if (consistencyPercentage >= 70) return "high_consistency";
  if (consistencyPercentage >= 40) return "medium_consistency";
  return "low_consistency";
};

export const getRandomMessage = (messageArray: string[]): string => {
  return messageArray[Math.floor(Math.random() * messageArray.length)];
};
