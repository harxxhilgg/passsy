"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LETTERS,
  MIN_LENGTH,
  buildCharset,
  generatePassword,
  calcStrength,
} from "@/lib/password";
import { PasswordDisplay } from "./password/password-display";
import { PasswordStrength } from "./password/password-strength";
import { PasswordLengthSlider } from "./password/password-length-slider";
import { PasswordOptions } from "./password/password-options";
import { CopiedAlert } from "./password/copied-alert";

export function StringGen() {
  const [length, setLength] = useState(MIN_LENGTH);
  const [withNumbers, setWithNumbers] = useState(false);
  const [withSpecials, setWithSpecials] = useState(false);
  const [randomString, setRandomString] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Generate only on the client — Math.random() on server causes hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomString(generatePassword(MIN_LENGTH, LETTERS));
  }, []);

  const regenerate = useCallback(
    (len: number, nums: boolean, specs: boolean) => {
      setRandomString(generatePassword(len, buildCharset(nums, specs)));
    },
    []
  );

  const handleLengthChange = useCallback(
    (nextLen: number) => {
      setLength(nextLen);
      regenerate(nextLen, withNumbers, withSpecials);
    },
    [regenerate, withNumbers, withSpecials]
  );

  const toggleNumbers = useCallback(() => {
    const next = !withNumbers;
    setWithNumbers(next);
    regenerate(length, next, withSpecials);
  }, [withNumbers, withSpecials, length, regenerate]);

  const toggleSpecials = useCallback(() => {
    const next = !withSpecials;
    setWithSpecials(next);
    regenerate(length, withNumbers, next);
  }, [withSpecials, withNumbers, length, regenerate]);

  const handleRefresh = useCallback(() => {
    regenerate(length, withNumbers, withSpecials);
  }, [regenerate, length, withNumbers, withSpecials]);

  const handleCopy = async () => {
    if (!randomString) return;
    await navigator.clipboard.writeText(randomString);
    setCopied(true);
    setShowAlert(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setShowAlert(false), 2500);
  };

  const strength = useMemo(
    () => calcStrength(length, withNumbers, withSpecials),
    [length, withNumbers, withSpecials]
  );

  return (
    <div className="flex flex-col gap-4 px-2">
      <PasswordDisplay
        value={randomString}
        copied={copied}
        onCopy={handleCopy}
        onRefresh={handleRefresh}
      />

      <PasswordStrength strength={strength} />

      <PasswordLengthSlider
        length={length}
        onLengthChange={handleLengthChange}
      />

      <PasswordOptions
        withNumbers={withNumbers}
        withSpecials={withSpecials}
        onToggleNumbers={toggleNumbers}
        onToggleSpecials={toggleSpecials}
      />

      <CopiedAlert show={showAlert} />
    </div>
  );
}
