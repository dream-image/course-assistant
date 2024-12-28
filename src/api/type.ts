export type LoginInfo = {
    username?: string,
    password?: string
}

export interface GetLessonListParams{
    limit:number;
    offset:number;
    
}