import { Card, CardContent } from "../ui/card";
import robot from "../../../public/robot.svg";

const YaoBot = () => {
  return (
    <div className="fixed z-20 bottom-6 right-6">
      <Card className=" border-none py-3.5 gradient-card">
        <CardContent className="p-3 py-0 cursor-pointer">
          <div className="flex flex-col items-center space-y-0.5 ">
            <div className=" flex items-center justify-center">
              <img src={robot} alt="YAO Bot" />
            </div>
            <span className="text-[#7E868C] text-sm font-medium">YOA Bot</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YaoBot;
