export type LoginInfo = {
    username?: string,
    password?: string
}

export interface GetLessonListParams {
    limit: number;
    offset: number;

}
export type LessonType = {
    id: number;
    name: string;
    createTime: string;
    ownerId: number;
}
export interface GetLessonListResponse {

    data: {
        total: number;
        lessonList: LessonType[]
    }


}