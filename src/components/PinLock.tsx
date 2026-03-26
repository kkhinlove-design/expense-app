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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-10 shadow-2xl w-full max-w-sm text-center animate-fade-in-up">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
          {person.name}{person.title ? ` ${person.title}` : ""}
        </h2>
        <p className="text-sm text-gray-400 mb-8">비밀번호 4자리를 입력하세요</p>

        <div className="flex justify-center gap-4 mb-5">
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
              className={`w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none transition-all duration-300 ${
                error
                  ? "border-2 border-red-400 bg-red-50 animate-[shake_0.3s_ease-in-out]"
                  : digit
                  ? "border-2 border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/20"
                  : "border-2 border-gray-200 bg-white/60 focus:border-indigo-500 focus:shadow-md focus:shadow-indigo-500/20"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-red-500 font-medium animate-fade-in-up">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            비밀번호가 틀렸습니다
          </div>
        )}
      </div>
    </div>
  );
}
