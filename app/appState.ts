export interface User {
    name: string;
    id: number;
    maxResponseTime: number;
    minTable: number;
    maxTable: number;
    targetResponseTime: number;
}

export type AppState = {
    step: "select-user" | "quiz" | "result";
    user: User | null;

};
