import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pen, Eraser, Square, Circle, Type, Share2 } from "lucide-react";
import { Canvas } from "@/components/logic/canvas";

export default function ModernWhiteboard() {
  const [activeColor, setActiveColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(5);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
        <h1 className="text-2xl font-bold">InkSync</h1>
        <Button
          variant="ghost"
          className="hover:bg-gray-700 transition-colors duration-200"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </header>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-4 bg-gray-800 rounded-full p-2 shadow-lg">
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <Pen className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <Eraser className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-700 transition-colors duration-200"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="hover:bg-gray-700">
                  <Square className="h-4 w-4 mr-2" />
                  Square
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">
                  <Circle className="h-4 w-4 mr-2" />
                  Circle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <Type className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 bg-gray-800 rounded-full p-2 shadow-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded-full overflow-hidden opacity-0 absolute"
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white"
                style={{ backgroundColor: activeColor }}
              />
            </div>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              max={20}
              step={1}
              className="w-24 mt-2"
            />
          </div>
        </div>
        <div className="flex-1 bg-gray-800" id="canvas">
          <Canvas />
        </div>
      </div>
    </div>
  );
}
