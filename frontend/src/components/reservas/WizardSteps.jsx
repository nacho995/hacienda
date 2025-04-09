"use client";

import { useState } from 'react';
import { FaCheckCircle, FaCircle } from 'react-icons/fa';

/**
 * WizardSteps component
 * 
 * Displays a wizard-like progression of steps
 * 
 * @param {Object} props
 * @param {number} props.currentStep - The current step
 * @param {Array<string>} props.steps - The list of steps
 */
export default function WizardSteps({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex-1 text-center ${
            index === currentStep
              ? 'text-[var(--color-primary)] font-semibold'
              : index < currentStep
              ? 'text-[var(--color-primary)]'
              : 'text-gray-400'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              {index === currentStep ? (
                <FaCheckCircle className="text-[var(--color-primary)] text-2xl" />
              ) : index < currentStep ? (
                <FaCheckCircle className="text-[var(--color-primary)] text-2xl" />
              ) : (
                <div className="text-gray-300 text-2xl flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300">
                  {index + 1}
                </div>
              )}
            </div>
            <span className="mt-3 text-sm font-medium">
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px mx-4 bg-gray-200 relative">
              <div
                className={`absolute inset-0 h-1 ${
                  index < currentStep
                    ? 'bg-[var(--color-primary)]'
                    : index === currentStep - 1
                    ? 'bg-[var(--color-primary)]/50'
                    : 'bg-gray-200'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
