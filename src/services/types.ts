export interface AnimationFrame {
    id?: string;
    begin: number;
    duration: number;
    set?: {
        [key: string]: string | number;
    };
    offset?: {
        [key: string]: string | number;
    };
}