export interface Data {
    content: string;
    count: number;
    level: "easy" | "medium" | "hard";
    type: "mcq" | "true-false"; // Updated type
    custom: string;
    timer: number; // Added timer field
  }