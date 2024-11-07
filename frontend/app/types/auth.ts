export interface User {
    id: number;
    loginID: string;
    name: string;
    role: 'librarian' | 'student';
}

export interface LoginResponse {
    token: string;
    user: User;
}