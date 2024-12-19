// Legend.tsx
import { Card, CardContent } from "@/components/ui/card";
import { CheckboxWithText } from "../../ui/checkboxWithText";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type LegendProps = {
  handlePowerLines: (checked: boolean) => void;
  handleSubstation: (checked: boolean) => void;
};

const Legend = ({ handlePowerLines, handleSubstation }: LegendProps) => {
  const [isMinimised, setMinimised] = useState(false);

  return (
    <div className="absolute bottom-8 right-4 bg-white z-20">
      <Card className="w-72 py-2 rounded-lg shadow-md">
        <button
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
          onClick={() => setMinimised(!isMinimised)}
        >
          {isMinimised ? <div className="flex items-center font-sm font-semibold">Show<ChevronUp size={20} /></div>: <ChevronDown size={20} />}
        </button>
        <CardContent >
          <div className={`flex flex-col gap-4 ${isMinimised ? 'hidden': ''}`}>
            <div>
              <h3 className="font-semibold mb-2">Solar Farm Status</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Operating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Under Construction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Announced/Pre-construction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm">Shelved</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Capacity</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                  <span className="text-sm">≥ 100 MW</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                  <span className="text-sm">50-99 MW</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                  <span className="text-sm">20-49 MW</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                  <span className="text-sm">&lt;20 MW</span>
                </div>
              </div>
            </div>
            <CheckboxWithText
              title="Show Power Lines"
              onCheckedChange={handlePowerLines}
            />
            <CheckboxWithText
              title="Show Substation"
              onCheckedChange={handleSubstation}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Legend;
