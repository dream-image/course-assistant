import { REQUEST_BASE_URL } from "@/common/request";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import styles from "./styles.module.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
type Props = {
  fileName: string;
  className?: string;
  lessonId: number;
  uId: number;
  fileExt: string;
};

// 配置 worker（关键修复步骤）
import * as pdfjs from "pdfjs-dist";
import { Alert, cn } from "@heroui/react";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const PdfPreview = (props: Props) => {
  const { lessonId, uId, fileExt } = props;
  let { fileName } = props;
  let fileUrl = "";
  const fileNameList = fileName.split(".");
  fileNameList.pop();
  fileNameList.push("pdf");
  fileName = fileNameList.join(".");
  fileUrl = `${REQUEST_BASE_URL}/upload/lesson/${uId}/${
    lessonId + "-pdf"
  }/${fileName}`;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className={cn(props.className, styles.scroll)}>
        <Viewer
          fileUrl={fileUrl}
          renderError={(err) => {
            return (
              <div className="">
                {" "}
                <Alert color="danger" className="">
                  抱歉，格式转化失败，该类型文件暂不支持预览😢
                </Alert>
              </div>
            );
          }}
        />
      </div>
    </Worker>
  );
};
export default PdfPreview;
