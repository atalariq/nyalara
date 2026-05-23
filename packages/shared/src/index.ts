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
