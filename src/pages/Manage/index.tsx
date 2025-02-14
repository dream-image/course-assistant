import { Card, CardBody, CardHeader, Tab, Tabs } from "@nextui-org/react";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
const Manage = () => {
  const [tabKey, setTabKey] = useState<string>("center");
  return (
    <div className=" w-[1680px] h-full flex ml-4 relative">
      <div className="h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl">
        <Tabs
          aria-label="Options"
          variant="light"
          isVertical={true}
          onSelectionChange={(e) => {
            setTabKey(e.toString());
          }}
        >
          <Tab key="center" title="我的课程"></Tab>
          {/* <Tab key="myLesson" title="我教的课">
  
            </Tab> */}
        </Tabs>
      </div>
      <div className="w-full flex justify-start h-full">
        <Card className={`w-11/12 animate__animated  animate__fadeIn h-[95%] `}>
          {tabKey === "center" && (
            <>
              <CardHeader>
                <div className="flex flex-row justify-between w-full items-center">
                  <span className="text-xl flex-1">我的课程</span>
                </div>
              </CardHeader>
              <CardBody></CardBody>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
export default Manage;
