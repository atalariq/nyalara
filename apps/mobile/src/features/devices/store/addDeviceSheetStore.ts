import { create } from "zustand";

type AddDeviceSheetStore = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
};

export const useAddDeviceSheetStore = create<AddDeviceSheetStore>((set) => ({
  isOpen: false,
  setOpen: (value) => set({ isOpen: value }),
}));
