export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ElectricityPeriod = {
  startDate: string;
  endDate: string;
  month: string;
};

export type CalculateElectricityKwhRequest = {
  inputType: "kwh";
  timezoneOffsetMinutes: number;
  input: {
    kwh: number;
    meterStart: null;
    meterEnd: null;
    unit: "kwh";
  };
  period: ElectricityPeriod;
};

export type CalculateElectricityMeterReadingRequest = {
  inputType: "meter_reading";
  timezoneOffsetMinutes: number;
  input: {
    kwh: null;
    meterStart: number;
    meterEnd: number;
    unit: "kwh";
  };
  period: ElectricityPeriod;
};

export type CalculateElectricityRequest =
  | CalculateElectricityKwhRequest
  | CalculateElectricityMeterReadingRequest;

export type VerifiedElectricityCalculation = {
  electricityKwh: number;
  emissionFactorId: string;
  emissionFactorKgCo2ePerKwh: number;
  totalKgCo2e: number;
  method: "server_verified";
  status: "verified";
};

export type CalculateElectricitySuccessResponse =
  ApiSuccess<VerifiedElectricityCalculation>;

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type CarbonActivityCategory =
  | "transport"
  | "electricity"
  | "food"
  | "waste";

export type CarbonActivity = {
  id: string;
  userId: string;
  category: CarbonActivityCategory;
  amount: number;
  unit: string;
  co2Kg: number;
  createdAt: string;
  updatedAt: string;
};
