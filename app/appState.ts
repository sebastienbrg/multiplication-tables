export interface User {
    name: string;
    id: number;
    maxTimeToRespond: number;
}

export type AppState = {
    step: "select-user" | "quiz" | "result";
    user: User | null;
    userMaxTimeToRespond: number;
};
