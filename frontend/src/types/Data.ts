export interface Data {
    content: string,
    count: number,
    level: "easy" | "medium" | "hard",
    type: "factual" | "conceptual",
    custom: string
}