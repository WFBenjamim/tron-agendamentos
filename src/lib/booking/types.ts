export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
  summary?: string;
};

export const bookingInitialState: BookingState = {
  status: "idle",
};
