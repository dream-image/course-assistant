import { cn } from "@heroui/react";
import "./styles.less";
const LoaderAnimation = () => {
  return (
    <div
      className={cn(
        "flex justify-center flex-col  w-full  items-center animate-pulse",
      )}
    >
      <svg
        viewBox="0 0 1024 1024"
        width="48"
        height="48"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        className="animation"
      >
        <g>
          <path
            className={"animation-delay-1"}
            id="svg_1"
            p-id="5280"
            fill="#4dabf7"
            d="m887.296,259.328l-162.304,-23.808a83.456,83.456 0 0 1 3.072,15.104l47.104,483.84a82.944,82.944 0 0 1 -74.496,90.624l-219.136,21.248a82.432,82.432 0 0 0 41.216,18.688l270.848,39.68a82.944,82.944 0 0 0 94.208,-70.144l69.632,-481.28a82.944,82.944 0 0 0 -70.144,-93.952z"
          />
          <path
            id="svg_2"
            p-id="5281"
            opacity="0.55"
            fill="#4dabf7"
            className={"animation-delay-2"}
            d="m774.912,734.464l-47.104,-483.84a83.2,83.2 0 0 0 -90.624,-74.496l-87.296,8.448l13.312,45.824l112.64,418.56a82.944,82.944 0 0 1 -58.368,102.4l-165.12,44.8l-96.512,25.6a82.944,82.944 0 0 0 71.936,29.696l53.248,-5.12l219.136,-21.248a82.944,82.944 0 0 0 74.752,-90.624z"
          />
          <path
            id="svg_3"
            p-id="5282"
            opacity="0.15"
            fill="#4dabf7"
            className={"animation-delay-3"}
            d="m675.84,650.96l-112.64,-418.56l-12.544,-46.08l0,-4.608a82.944,82.944 0 0 0 -102.4,-58.368l-265.728,71.68a82.944,82.944 0 0 0 -28.928,15.104l139.008,102.4l204.8,150.528l11.264,8.192a82.944,82.944 0 0 1 17.92,115.968l-58.88,80.384l-102.4,140.032a82.944,82.944 0 0 1 -11.776,12.8l2.56,3.328l96.512,-25.6l165.12,-44.8a82.944,82.944 0 0 0 58.112,-102.4z"
          />
          <text
            opacity="0.9"
            fontWeight="bold"
            xmlSpace="preserve"
            textAnchor="start"
            fontFamily="Noto Sans JP"
            fontSize="100"
            id="svg_4"
            y="488.99997"
            x="150.99998"
            fill="#4dabfc"
            className={"animation-delay-4"}
          >
            Tian
          </text>
          <text
            opacity="0.9"
            fontWeight="bold"
            xmlSpace="preserve"
            textAnchor="start"
            fontFamily="Noto Sans JP"
            fontSize="100"
            id="svg_5"
            y="623.99997"
            x="151"
            fill="#4dabfc"
            className={"animation-delay-4"}
          >
            Book
          </text>
        </g>
      </svg>
      <p className="opacity-55 font-medium">加载中</p>
    </div>
  );
};

export default LoaderAnimation;
