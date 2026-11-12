"use client";

import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { Button } from "../ui/button";

export function NFlowEx() {
  const [value, setValue] = useState<number>(13.5);

  const shuffle = () => {
    setValue(Math.random() * 100);
  }

  return (
    <>
      <NumberFlow
        value={value}
        format={{ style: "currency", currency: "INR" }}
        className="text-5xl font-semibold"
      />

      <Button
        className={"w-full"}
        variant={"secondary"}
        onClick={shuffle}
      >
        Shuffle
      </Button>
    </>
  )
}