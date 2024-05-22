export interface IChat {
  text: string;
  side: "left" | "right";
}

interface IToast {
  duration: number;
  content: string;
  type: "info" | "success" | "error" | "warning";
}
