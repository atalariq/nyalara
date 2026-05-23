import { OnboardingSlideData } from "../types";

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: "1",
    labelText: "Real-Time\nUsage",
    deviceName: "Living Room",
    deviceKwh: "0.02 kWh",
    title: "Track electricity\nin real time",
    description:
      "Experience crystal-clear visibility into your home's energy consumption with our hyper-precise monitoring system.",
  },
  {
    id: "2",
    labelText: "Carbon\nFootprint",
    deviceName: "Kitchen Fridge",
    deviceKwh: "1.20 kWh",
    title: "Measure your\ncarbon impact",
    description:
      "Automatically calculate CO₂ emissions for every device in your home and see where you can make a difference.",
  },
  {
    id: "3",
    labelText: "Cost\nEstimator",
    deviceName: "AC Bedroom",
    deviceKwh: "3.50 kWh",
    title: "Save money,\nsave the planet",
    description:
      "Get real-time cost estimates and actionable tips to reduce your bill and carbon footprint.",
  },
];
