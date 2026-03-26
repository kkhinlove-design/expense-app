"use client";

import { useState, useRef, useEffect } from "react";
import { Person, MASTER_PIN } from "@/lib/people";

interface Props {
  person: Person;
  onUnlock: () => void;
}

export default function PinLock({ person, onUnlock }: Props) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // 4자리 모두 입력되면 검증
    if (index === 3 && value) {
      const entered = newPin.join("");
      if (entered === person.pin || entered === MASTER_PIN) {
        sessionStorage.setItem(`pin-${person.slug}`, "1");
        onUnlock();
      } else {
        setError(true);
        setPin(["", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-xs text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {person.name}{person.title ? ` ${person.title}` : ""}
        </h2>
        <p className="text-sm text-gray-500 mb-6">비밀번호를 입력하세요</p>
        <div className="flex justify-center gap-3 mb-4">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors ${
                error
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-500">비밀번호가 틀렸습니다</p>
        )}
      </div>
    </div>
  );
}
