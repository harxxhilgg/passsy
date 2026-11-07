"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

export function StringGen() {
  const [value, setValue] = useState(6);
  const [randomString, setRandomString] = useState<string>("");

  const genString = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    return Array.from({ length: value }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h2>{randomString}</h2>

      <Button onClick={() => setRandomString(genString())}>
        Generate
      </Button>

      <div className="w-full flex flex-row items-center px-2">
        <Slider
          value={[value]}
          onValueChange={(newValue) => setValue(newValue[0])}
          max={100}
          min={6}
          step={1}
        />

        <p className="text-lg font-semibold w-16 text-center">
          {value}
        </p>
      </div>
    </div>
  );
}