// features/devices/utils/carbonCalc.ts
import { CARBON_CONFIG } from "@/shared/config/carbonConfig";

export function calcMonthlyKwh(
  watt: number,
  hoursPerDay: number,
  daysPerMonth: number,
): number {
  return (watt * hoursPerDay * daysPerMonth) / 1000;
}

export function calcEmissions(kwh: number): number {
  return kwh * CARBON_CONFIG.emissionFactor;
}

export function calcCost(kwh: number): number {
  return kwh * CARBON_CONFIG.electricityRate;
}

export function calcAllEstimates(
  watt: number,
  hoursPerDay: number,
  daysPerMonth: number,
) {
  const kwh = calcMonthlyKwh(watt, hoursPerDay, daysPerMonth);
  return {
    kwh,
    emissions: calcEmissions(kwh),
    cost: calcCost(kwh),
  };
}
