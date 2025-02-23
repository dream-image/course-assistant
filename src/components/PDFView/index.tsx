import { REQUEST_BASE_URL } from "@/common/request";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import styles from "./styles.module.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
type Props = {
  fileName: string;
  className?: string;
  lessonId: number;
  uId: number;
};

// 配置 worker（关键修复步骤）
import * as pdfjs from "pdfjs-dist";
import { cn } from "@heroui/react";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const PdfPreview = (props: Props) => {
  const { fileName, lessonId, uId } = props;
  const fileUrl = `${REQUEST_BASE_URL}/upload/lesson/${uId}/${lessonId}/${fileName}`;

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className={cn(props.className, styles.scroll)}>
        <Viewer fileUrl={fileUrl} />
      </div>
    </Worker>
  );
};
export default PdfPreview;
