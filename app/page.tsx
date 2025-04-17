// BookROICalculator.tsx  —  v3 (advanced fields + priceless note)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Payload {
  copiesSold: number;
  bookPrice: number;
  newClients: number;
  clientValue: number;
  speakingGigs: number;
  speakingFee: number;
  emailSubscribers: number;
  valuePerSubscriber: number;
  dealSizeLiftPct: number;
  packageCost: number;
  grossRevenue: number;
  roiPercent: number;
}

const submitToHubspot = async (payload: Payload) => {
  try {
    const portal = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
    const form = process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID;
    if (!portal || !form) return;

    await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [{ name: "roi_payload", value: JSON.stringify(payload) }]
      })
    });
  } catch (err) {
    console.error("HubSpot submission failed", err);
  }
};

export default function BookROICalculator() {
  // Basic assumptions
  const [copiesSold, setCopiesSold] = useState(500);
  const [bookPrice, setBookPrice] = useState(20);
  const [newClients, setNewClients] = useState(5);
  const [clientValue, setClientValue] = useState(10000);
  const [speakingGigs, setSpeakingGigs] = useState(3);
  const [speakingFee, setSpeakingFee] = useState(5000);

  // Advanced assumptions
  const [emailSubscribers, setEmailSubscribers] = useState(1000);
  const [valuePerSubscriber, setValuePerSubscriber] = useState(5);
  const [dealSizeLiftPct, setDealSizeLiftPct] = useState(10);

  const [packageCost, setPackageCost] = useState(50000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<{ gross: number; roi: number } | null>(null);

  const calculate = () => {
    const grossFromBooks = copiesSold * bookPrice * 0.5; // 50% margin
    const grossFromClients = newClients * clientValue;
    const authorityPremium = (dealSizeLiftPct / 100) * grossFromClients;
    const grossFromSpeaking = speakingGigs * speakingFee;
    const grossFromEmail = emailSubscribers * valuePerSubscriber;

    const grossRevenue =
      grossFromBooks + grossFromClients + authorityPremium + grossFromSpeaking + grossFromEmail;

    const roiPercent = ((grossRevenue - packageCost) / packageCost) * 100;

    const payload: Payload = {
      copiesSold,
      bookPrice,
      newClients,
      clientValue,
      speakingGigs,
      speakingFee,
      emailSubscribers,
      valuePerSubscriber,
      dealSizeLiftPct,
      packageCost,
      grossRevenue,
      roiPercent
    };

    setResult({ gross: grossRevenue, roi: roiPercent });
    submitToHubspot(payload);
  };

  const wrapper = "flex flex-col gap-1 w-full";
  const inputField =
    "bg-gray-900 text-white placeholder-gray-400 border-gray-700 focus:border-[#aba78d] focus:ring-[#aba78d]";

  return (
    <Card className="max-w-xl mx-auto p-8 rounded-2xl bg-black text-white shadow-lg font-proxima">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center font-georgia">
          Book ROI Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* BASIC INPUTS */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              label: "Copies sold (forecast)",
              value: copiesSold,
              setter: setCopiesSold
            },
            { label: "Price per copy ($)", value: bookPrice, setter: setBookPrice },
            { label: "New clients expected", value: newClients, setter: setNewClients },
            { label: "Revenue per client ($)", value: clientValue, setter: setClientValue },
            { label: "Speaking gigs booked", value: speakingGigs, setter: setSpeakingGigs },
            { label: "Average speaking fee ($)", value: speakingFee, setter: setSpeakingFee },
            { label: "Package investment ($)", value: packageCost, setter: setPackageCost }
          ].map(({ label, value, setter }) => (
            <div key={label} className={wrapper}>
              <Label>{label}</Label>
              <Input
                type="number"
                className={inputField}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        {/* ADVANCED TOGGLE */}
        <button
          className="flex items-center gap-2 text-sm mt-2 focus:outline-none"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Advanced assumptions
        </button>

        {showAdvanced && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className={wrapper}>
              <Label>Email subscribers gained</Label>
              <Input
                type="number"
                className={inputField}
                value={emailSubscribers}
                onChange={(e) => setEmailSubscribers(Number(e.target.value))}
              />
            </div>
            <div className={wrapper}>
              <Label>Value per subscriber ($)</Label>
              <Input
                type="number"
                className={inputField}
                value={valuePerSubscriber}
                onChange={(e) => setValuePerSubscriber(Number(e.target.value))}
              />
            </div>
            <div className={wrapper}>
              <Label>Deal‑size lift (%)</Label>
              <Input
                type="number"
                className={inputField}
                value={dealSizeLiftPct}
                onChange={(e) => setDealSizeLiftPct(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <Button
          className="w-full bg-[#aba78d] hover:bg-[#9c987a] text-black font-semibold tracking-wide mt-4"
          onClick={calculate}
        >
          Calculate ROI
        </Button>

        {result && (
          <div className="mt-6 p-6 bg-gray-800 rounded-xl text-center space-y-4">
            <p className="text-lg font-medium font-georgia">
              Projected Gross Revenue:<span className="font-bold"> ${result.gross.toLocaleString()}</span>
            </p>
            <p className="text-lg font-proxima">
              ROI: <span className="font-bold">{result.roi.toFixed(1)}%</span>
            </p>
            <p className="italic text-sm text-gray-400">Finally finishing your book: priceless</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
