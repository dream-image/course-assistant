import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import styles from "./style.module.css";
type Props = {
  list: {
    value: string;
    label: string;
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
        <Button
          key={i.value}
          onClick={() => onSelect(i.value)}
          variant="bordered"
          className={`${i.value === value ? styles.active : ""}`}
        >
          {i.label}
        </Button>
      ))}
    </div>
  );
};

export default CustomeButtonRadioGroup;
