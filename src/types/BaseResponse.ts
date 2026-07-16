export type BaseResponse<T> = {
  message: string;
  status: "success" | "error";
  data: T;
};
