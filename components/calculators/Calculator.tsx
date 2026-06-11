"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Select, Toggle, Result } from "./ui";
import type { CalcKind } from "./registry";
import {
  calcTransactionTax,
  calcGrossYield,
  calcNetYield,
  calcIncomeTax,
  calcCGT,
  mtdMandation,
  calcSection24Reducer,
  calcMortgageMonthly,
  calcInterestOnlyMonthly,
  calcRentIncrease,
  calcDepositCap,
} from "@/lib/calculators";
import { gbp, pct } from "@/lib/format";

const NATIONS = [
  { value: "england", label: "England" },
  { value: "wales", label: "Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern_ireland", label: "Northern Ireland" },
];

type Nation = "england" | "wales" | "scotland" | "northern_ireland";

const num = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isFinite(n) ? n : 0;
};

export function Calculator({ kind }: { kind: CalcKind }) {
  return (
    <Card>
      <CardBody>
        {renderCalculator(kind)}
        <p className="mt-6 border-t border-hairline pt-4 text-xs text-slate">
          Indicative estimate only — not tax, legal or financial advice. Rates
          for the 2025/26 tax year. Verify with a qualified professional.
        </p>
      </CardBody>
    </Card>
  );
}

function renderCalculator(kind: CalcKind) {
  switch (kind) {
    case "stamp-duty":
      return <StampDuty />;
    case "yield":
      return <Yield />;
    case "income-tax":
      return <IncomeTax />;
    case "cgt":
      return <CGT />;
    case "mtd-estimator":
      return <MtdEstimator />;
    case "section-24":
      return <Section24 />;
    case "mortgage":
      return <Mortgage />;
    case "rent-increase":
      return <RentIncrease />;
    case "deposit-cap":
      return <DepositCap />;
    case "epc-checker":
      return <EpcChecker />;
  }
}

function StampDuty() {
  const [nation, setNation] = useState<Nation>("england");
  const [price, setPrice] = useState("300000");
  const [ftb, setFtb] = useState(false);
  const [additional, setAdditional] = useState(false);
  const res = calcTransactionTax(nation, num(price), {
    firstTimeBuyer: ftb,
    additionalProperty: additional,
  });
  return (
    <Grid>
      <div className="space-y-4">
        <Select label="Nation" value={nation} options={NATIONS} onChange={(e) => setNation(e.target.value as Nation)} />
        <Field label="Purchase price" prefix="£" value={price} onChange={(e) => setPrice(e.target.value)} />
        {nation !== "wales" && (
          <Toggle label="First-time buyer" checked={ftb} onChange={setFtb} />
        )}
        <Toggle label="Additional property / buy-to-let" checked={additional} onChange={setAdditional} />
      </div>
      <Results>
        <Result label={`${res.name} payable`} value={gbp(res.tax, { decimals: true })} emphasis />
        <Result label="Effective rate" value={pct((res.tax / (num(price) || 1)) * 100)} />
      </Results>
    </Grid>
  );
}

function Yield() {
  const [price, setPrice] = useState("200000");
  const [rent, setRent] = useState("1000");
  const [costs, setCosts] = useState("2400");
  const annualRent = num(rent) * 12;
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Purchase price" prefix="£" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Field label="Monthly rent" prefix="£" value={rent} onChange={(e) => setRent(e.target.value)} />
        <Field label="Annual running costs" prefix="£" value={costs} onChange={(e) => setCosts(e.target.value)} help="Management, insurance, repairs, etc." />
      </div>
      <Results>
        <Result label="Annual rent" value={gbp(annualRent)} />
        <Result label="Gross yield" value={pct(calcGrossYield(annualRent, num(price)))} emphasis />
        <Result label="Net yield" value={pct(calcNetYield(annualRent, num(costs), num(price)))} />
      </Results>
    </Grid>
  );
}

function IncomeTax() {
  const [income, setIncome] = useState("45000");
  const tax = calcIncomeTax(num(income));
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Taxable income (rUK)" prefix="£" value={income} onChange={(e) => setIncome(e.target.value)} help="Scotland has separate bands — coming soon." />
      </div>
      <Results>
        <Result label="Income tax" value={gbp(tax, { decimals: true })} emphasis />
        <Result label="Take-home (before NI)" value={gbp(num(income) - tax)} />
        <Result label="Effective rate" value={pct((tax / (num(income) || 1)) * 100)} />
      </Results>
    </Grid>
  );
}

function CGT() {
  const [gain, setGain] = useState("40000");
  const [otherIncome, setOtherIncome] = useState("45000");
  const tax = calcCGT(num(gain), { otherIncome: num(otherIncome) });
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Chargeable gain" prefix="£" value={gain} onChange={(e) => setGain(e.target.value)} />
        <Field label="Other taxable income" prefix="£" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} />
      </div>
      <Results>
        <Result label="CGT (residential)" value={gbp(tax, { decimals: true })} emphasis />
        <Result label="After £3,000 exemption" value={gbp(Math.max(0, num(gain) - 3000))} />
      </Results>
    </Grid>
  );
}

function MtdEstimator() {
  const [income, setIncome] = useState("55000");
  const m = mtdMandation(num(income));
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Qualifying income (self-employment + property)" prefix="£" value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>
      <Results>
        <Result label="MTD for Income Tax applies" value={m.mandated ? "Yes" : "Not yet"} emphasis />
        {m.mandated && <Result label="Mandated from" value={m.from!} />}
        {m.mandated && <Result label="Threshold band" value={gbp(m.band!)} />}
        {!m.mandated && <Result label="Below the £20,000 band" value="Monitor future thresholds" />}
      </Results>
    </Grid>
  );
}

function Section24() {
  const [finance, setFinance] = useState("6000");
  const reducer = calcSection24Reducer(num(finance));
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Mortgage interest & finance costs" prefix="£" value={finance} onChange={(e) => setFinance(e.target.value)} />
      </div>
      <Results>
        <Result label="Basic-rate tax reducer (20%)" value={gbp(reducer, { decimals: true })} emphasis />
        <Result label="Note" value="Not a deduction" />
      </Results>
    </Grid>
  );
}

function Mortgage() {
  const [principal, setPrincipal] = useState("150000");
  const [rate, setRate] = useState("5.5");
  const [term, setTerm] = useState("25");
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Loan amount" prefix="£" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <Field label="Interest rate" suffix="%" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Field label="Term (years)" value={term} onChange={(e) => setTerm(e.target.value)} />
      </div>
      <Results>
        <Result label="Repayment (monthly)" value={gbp(calcMortgageMonthly(num(principal), num(rate), num(term)), { decimals: true })} emphasis />
        <Result label="Interest-only (monthly)" value={gbp(calcInterestOnlyMonthly(num(principal), num(rate)), { decimals: true })} />
      </Results>
    </Grid>
  );
}

function RentIncrease() {
  const [rent, setRent] = useState("1000");
  const [increase, setIncrease] = useState("5");
  const r = calcRentIncrease(num(rent), num(increase));
  return (
    <Grid>
      <div className="space-y-4">
        <Field label="Current monthly rent" prefix="£" value={rent} onChange={(e) => setRent(e.target.value)} />
        <Field label="Increase" suffix="%" value={increase} onChange={(e) => setIncrease(e.target.value)} />
      </div>
      <Results>
        <Result label="New monthly rent" value={gbp(r.newRent, { decimals: true })} emphasis />
        <Result label="Monthly increase" value={gbp(r.monthlyDelta, { decimals: true })} />
        <Result label="Annual increase" value={gbp(r.monthlyDelta * 12, { decimals: true })} />
      </Results>
    </Grid>
  );
}

function DepositCap() {
  const [nation, setNation] = useState<Nation>("england");
  const [rent, setRent] = useState("1000");
  const annualRent = num(rent) * 12;
  const r = calcDepositCap(nation, annualRent);
  return (
    <Grid>
      <div className="space-y-4">
        <Select label="Nation" value={nation} options={NATIONS} onChange={(e) => setNation(e.target.value as Nation)} />
        <Field label="Monthly rent" prefix="£" value={rent} onChange={(e) => setRent(e.target.value)} />
      </div>
      <Results>
        <Result label="Maximum deposit" value={gbp(r.cap, { decimals: true })} emphasis />
        <Result label="Basis" value={r.basis} />
      </Results>
    </Grid>
  );
}

function EpcChecker() {
  const [rating, setRating] = useState("D");
  const grades = ["A", "B", "C", "D", "E", "F", "G"];
  const order = grades.indexOf(rating);
  const minToLet = grades.indexOf("E"); // current MEES minimum
  const canLet = order <= minToLet;
  const meetsProposedC = order <= grades.indexOf("C");
  return (
    <Grid>
      <div className="space-y-4">
        <Select
          label="EPC rating"
          value={rating}
          options={grades.map((g) => ({ value: g, label: g }))}
          onChange={(e) => setRating(e.target.value)}
        />
      </div>
      <Results>
        <Result label="Meets current MEES (min E)" value={canLet ? "Yes" : "No — cannot let"} emphasis />
        <Result label="Meets proposed min C" value={meetsProposedC ? "Yes" : "Not yet"} />
        <Result label="Note" value="MEES is tightening — watch for a future minimum of C." />
      </Results>
    </Grid>
  );
}

// ---- layout helpers ----
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-8 md:grid-cols-2">{children}</div>;
}
function Results({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lintel bg-paper p-4">
      <div className="space-y-1">{children}</div>
    </div>
  );
}
