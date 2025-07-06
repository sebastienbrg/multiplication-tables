export interface User {
    name: string;
    id: number;
    maxResponseTime: number;
}

export type AppState = {
    step: "select-user" | "quiz" | "result";
    user: User | null;
};
