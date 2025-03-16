import { message } from "antd";
import hljs from "highlight.js";
import "highlight.js/styles/tokyo-night-dark.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // 引入 KaTeX 的样式
import Markdown from "react-markdown";
import styles from "./style.module.css";
import { Button } from "antd";
import { cn } from "@heroui/react";
// 自动检测并包裹 LaTeX 公式的函数
function wrapLaTeX(content: string) {
  // 还原转义字符
  content = content.replace(/\\\\/g, "\\");

  // 匹配块级公式
  const blockRegex =
    /\\begin\{([a-zA-Z0-9*]+)\}([\s\S]*?)\\end\{\1\}|\\\[([\s\S]*?)\\\]|(\$\$[\s\S]*?\$\$)/g;

  // 匹配内联公式
  const inlineRegex = /\\\(([\s\S]*?)\\\)|\$([^$]+)\$/g;

  // 包裹块级公式
  content = content.replace(blockRegex, (match) => `$$${match}$$`);

  // 包裹内联公式
  content = content.replace(inlineRegex, (match, group1, group2) => {
    const formula = group1 || group2; // 匹配 \(...) 或 $ ... $
    return `$${formula}$$`;
  });

  return content;
}
const CodeBlock = ({
  className,
  children,
}: {
  className?: string;
  children: any;
}) => {
  const language = className?.replace(/language-/g, "") || "";
  const codeContent = String(children).replace(/\n$/, "");

  // 高亮处理
  let highlightedContent = codeContent;
  if (language && hljs.getLanguage(language)) {
    try {
      highlightedContent = hljs.highlight(codeContent, {
        language,
        ignoreIllegals: true,
      }).value;
    } catch (err) {
      console.error("Syntax highlighting error:", err);
    }
  }

  // 复制处理
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      message.success("复制成功!");
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <>
      <div
        className={`${styles["code-block-wrapper"]} bg-[#181d28] text-slate-50 flex flex-col ring-inset ring-1 ring-offset-cyan-100 rounded-lg overflow-hidden`}
      >
        <div className=" flex justify-between items-center pl-3 bg-[#50505a]">
          <span>{language}</span>
          <Button
            size="small"
            color="default"
            variant="text"
            className={`flex items-center ${styles["copy-button"]}"`}
            onClick={handleCopy}
          >
            <svg
              viewBox="0 0 24 24"
              height="12"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="none">
                <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
                <path
                  d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"
                  fill="currentColor"
                ></path>
              </g>
            </svg>

            <span className={styles["sp"]}>复制</span>
          </Button>
        </div>
        <pre
          className="hljs language-${lang} border-0 flex-1 m-0 style-yes text-xs"
          style={{
            margin: 0,
          }}
        >
          <code dangerouslySetInnerHTML={{ __html: highlightedContent }}></code>
        </pre>
      </div>
    </>
  );
};
const MarkdownRenderer = ({
  data,
}: {
  data: {
    content?: string | React.ReactNode;
    className?: string;
    isThink?: boolean;
  }[];
}) => {
  const length = data.length;

  return (
    <div>
      {data.map((i, index) => {
        const { className, isThink, content } = i;
        if (!content) return null;
        if (typeof content !== "string") {
          return <>{content}</>;
        }
        if (isThink) {
          return (
            <blockquote>
              <Markdown
                remarkPlugins={[remarkMath]} // 解析 Markdown 中的数学公式
                rehypePlugins={[rehypeKatex]} // 将数学公式转换为 KaTeX 格式
                className={cn(
                  styles["markdown-wrapper"],
                  className,
                  length === 1
                    ? ""
                    : index === 0
                      ? styles["first-block"]
                      : index === length - 1
                        ? styles["last-block"]
                        : styles["common-block"],
                )}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <CodeBlock
                        className={cn(className)}
                        children={children}
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </blockquote>
          );
        }
        return (
          <Markdown
            remarkPlugins={[remarkMath]} // 解析 Markdown 中的数学公式
            rehypePlugins={[rehypeKatex]} // 将数学公式转换为 KaTeX 格式
            className={cn(
              styles["markdown-wrapper"],
              className,
              length === 1
                ? ""
                : index === 0
                  ? styles["first-block"]
                  : index === length - 1
                    ? styles["last-block"]
                    : styles["common-block"],
            )}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <CodeBlock className={className} children={children} />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </Markdown>
        );
      })}
    </div>
  );
};
export default MarkdownRenderer;
