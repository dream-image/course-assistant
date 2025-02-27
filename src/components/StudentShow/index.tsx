import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  cn,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@heroui/react";
import dayjs from "dayjs";
import { LessonType, LessonUserType } from "@/api/type";
import { REQUEST_BASE_URL } from "@/common/request";
import { quitLesson } from "@/api";
import { message } from "antd";

export const columns = [
  { name: "姓名", uid: "nickname" },
  { name: "ID", uid: "userId" },
  { name: "身份", uid: "role" },
  { name: "交流次数", uid: "useCount" },
  { name: "加入时间", uid: "joinTime" },
  { name: "操作", uid: "actions" },
];

export const DeleteIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};

function getColor(t: number) {
  const hue = 230; // 色相（蓝色）
  const saturation = 100; // 饱和度100%
  const minLightness = 40; // 最深亮度
  const maxLightness = 95; // 最浅亮度
  const clampedT = Math.min(1000, Math.max(0, t)) / 1000; // 限制t在0到1000之间
  const lightness = maxLightness - (maxLightness - minLightness) * clampedT;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

type Props = {
  users: LessonUserType[];
  userId: number;
  lessonInfo?: LessonType;
  refreshLessonStudents: () => Promise<void>;
};
const StudentShow = (props: Props) => {
  const { users, userId, lessonInfo, refreshLessonStudents } = props;
  const renderCell = React.useCallback(
    (user: LessonUserType, columnKey: keyof LessonUserType) => {
      const cellValue = user[columnKey];
      switch (columnKey) {
        case "nickname":
          return (
            <User
              avatarProps={{
                radius: "lg",
                src: `${REQUEST_BASE_URL}/cover/${user?.avatar}`,
              }}
              description={user.email}
              name={
                <>
                  {cellValue}
                  {user.userId === userId ? (
                    <Chip
                      size="sm"
                      className=" ml-2"
                      color="warning"
                      variant="bordered"
                    >
                      自己
                    </Chip>
                  ) : null}
                </>
              }
            >
              {user.email}
            </User>
          );
        case "role":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{cellValue}</p>
              {/* <p className="text-bold text-sm capitalize text-default-400">
              {user.team}
            </p> */}
            </div>
          );
        case "useCount":
          return (
            <Chip
              style={{
                backgroundColor: getColor(cellValue),
              }}
              className="capitalize text-slate-100"
              size="sm"
            >
              {cellValue}
            </Chip>
          );
        case "joinTime":
          return (
            <Chip
              className="capitalize"
              color={"warning"}
              size="sm"
              variant="flat"
            >
              {dayjs(cellValue).format("YYYY-MM-DD HH:mm:ss")}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Popover placement="left-end">
                <PopoverTrigger>
                  <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon />
                  </span>
                </PopoverTrigger>
                <PopoverContent>
                  {(titleProps) => {
                    return (
                      <>
                        <div className="px-1 py-2">
                          <p
                            className="text-small font-bold text-foreground"
                            {...titleProps}
                          >
                            确定要移除吗？
                          </p>
                          <div className="text-tiny">
                            移除后学生无法再次加入该课程
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 w-full">
                          <Button
                            color="danger"
                            size="sm"
                            onPress={async () => {
                              try {
                                await quitLesson({
                                  lessonId: lessonInfo!.lessonId,
                                  userId: user.userId,
                                });
                                refreshLessonStudents();
                                message.success("移除成功");
                              } catch (error: any) {
                                console.log(error);
                                const msg =
                                  error?.error_msg || error?.message || error;
                                message.error(msg);
                              }
                            }}
                          >
                            确定
                          </Button>
                        </div>
                      </>
                    );
                  }}
                </PopoverContent>
              </Popover>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [users, lessonInfo],
  );

  return (
    <Table aria-label="Example table with custom cells" isStriped>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={users}>
        {(item) => (
          <TableRow key={item.userId}>
            {(columnKey) => (
              <TableCell>
                {renderCell(item, columnKey as keyof LessonUserType)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export default StudentShow;
