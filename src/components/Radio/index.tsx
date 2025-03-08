import { useEffect } from "react";
import { Button } from "@heroui/react";
import styles from "./style.module.css";
import { Tooltip } from "antd";
type Props = {
  list: {
    value: string;
    label: string;
    description?: string;
  }[];
  defaultValue?: string | null;
  value?: string;
  onSelect: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
};

const CustomeButtonRadioGroup = (props: Props) => {
  const { list, defaultValue, value, onSelect, style, className } = props;
  useEffect(() => {
    if (!value && defaultValue) {
      onSelect(defaultValue);
    }
  }, [defaultValue, value]);

  return (
    <div style={style} className={className}>
      {list.map((i) => (
        <Tooltip
          title={i.description}
          arrow={false}
          overlayInnerStyle={{
            color: "black",
            backgroundColor: "#fff",
          }}
        >
          <Button
            key={i.value}
            onPress={() => onSelect(i.value)}
            variant="bordered"
            className={`${i.value === value ? styles.active : ""}`}
          >
            {i.label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
};

export default CustomeButtonRadioGroup;
