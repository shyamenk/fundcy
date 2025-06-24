"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface InvestmentHolding {
  id: string;
  name: string;
  type: string;
  units?: number;
  currentPrice?: number;
  avgPurchasePrice?: number;
  currentValue: number;
  totalInvested: number;
  returns: number;
  returnsPercentage: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  holdingPeriod?: string;
  fundHouse?: string;
  category?: string;
  riskLevel?: string;
}

interface SIPInvestment {
  id: string;
  holdingId: string;
  amount: number;
  frequency: string;
  startDate: string;
  nextSipDate?: string;
  isActive: boolean;
  totalInvested: number;
  totalUnits: number;
  fundName?: string;
  holding: InvestmentHolding;
}

interface EditingItem {
  type: "holding" | "sip";
  data: InvestmentHolding | SIPInvestment;
}

const investmentTypes = [
  "mutual_fund",
  "direct_stocks",
  "index_fund",
  "small_cap",
  "mid_cap",
  "large_cap",
  "bonds",
  "etf",
  "cryptocurrency",
  "real_estate",
  "other",
];

const sipFrequencies = ["daily", "weekly", "monthly", "quarterly", "yearly"];

const riskLevels = ["Low", "Moderate", "High"];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"holding" | "sip">("holding");

  const [holdingForm, setHoldingForm] = useState({
    name: "",
    type: "",
    units: "",
    currentPrice: "",
    avgPurchasePrice: "",
    firstPurchaseDate: "",
    lastPurchaseDate: "",
    totalInvested: "",
    fundHouse: "",
    category: "",
    riskLevel: "",
  });

  const [sipForm, setSipForm] = useState({
    holdingId: "",
    amount: "",
    frequency: "",
    startDate: new Date().toISOString().slice(0, 10),
    nextSipDate: new Date().toISOString().slice(0, 10),
    isActive: true,
    fundName: "",
  });

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("/api/dashboard/portfolio");
      const data = await response.json();

      // Convert string values to numbers for calculations
      const processedHoldings = (data.holdings || []).map(
        (holding: InvestmentHolding) => ({
          ...holding,
          currentValue: parseFloat(String(holding.currentValue)),
          totalInvested: parseFloat(String(holding.totalInvested)),
          returns: parseFloat(String(holding.returns)),
          returnsPercentage: parseFloat(String(holding.returnsPercentage)),
          units: holding.units ? parseFloat(String(holding.units)) : undefined,
          currentPrice: holding.currentPrice ? parseFloat(String(holding.currentPrice)) : undefined,
          avgPurchasePrice: holding.avgPurchasePrice ? parseFloat(String(holding.avgPurchasePrice)) : undefined,
        })
      );

      const processedSIPs = (data.sips || []).map((sip: SIPInvestment) => ({
        ...sip,
        amount: parseFloat(String(sip.amount)),
        totalInvested: parseFloat(String(sip.totalInvested)),
        totalUnits: parseFloat(String(sip.totalUnits)),
        holding: processedHoldings.find(
          (h: InvestmentHolding) => h.id === sip.holdingId
        ),
      }));

      setHoldings(processedHoldings);
      setSipInvestments(processedSIPs);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPortfolioValue = holdings.reduce(
    (sum, holding) => sum + holding.currentValue,
    0
  );
  const totalInvested = holdings.reduce(
    (sum, holding) => sum + holding.totalInvested,
    0
  );
  const totalReturns = holdings.reduce(
    (sum, holding) => sum + holding.returns,
    0
  );
  const totalReturnsPercentage =
    totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const activeSIPs = sipInvestments.filter(sip => sip.isActive);
  const totalSIPAmount = activeSIPs.reduce((sum, sip) => sum + sip.amount, 0);

  const calculateCurrentValue = (units: string, currentPrice: string) => {
    const u = parseFloat(units || "0");
    const p = parseFloat(currentPrice || "0");
    return u * p;
  };

  const calculateUnrealizedGain = (
    currentValue: number,
    totalInvested: string
  ) => {
    return currentValue - parseFloat(totalInvested || "0");
  };

  const calculateReturnPercentage = (gain: number, totalInvested: string) => {
    const invested = parseFloat(totalInvested || "0");
    return invested > 0 ? (gain / invested) * 100 : 0;
  };

  const calculateHoldingPeriod = (first: string, last: string) => {
    if (!first || !last) return "";
    const d1 = new Date(first);
    const d2 = new Date(last);
    const months =
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth());
    if (months < 0) return "";
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return `${years} year${years !== 1 ? "s" : ""}${remMonths ? ` ${remMonths} month${remMonths !== 1 ? "s" : ""}` : ""}`;
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `/api/dashboard/portfolio/${editingItem?.data.id}`
        : "/api/dashboard/portfolio";
      const method = isEditing ? "PUT" : "POST";

      let payload;
      if (activeTab === "holding") {
        // Validate holding form
        if (
          !holdingForm.name ||
          !holdingForm.units ||
          !holdingForm.currentPrice ||
          !holdingForm.avgPurchasePrice ||
          !holdingForm.totalInvested ||
          !holdingForm.firstPurchaseDate ||
          !holdingForm.lastPurchaseDate
        ) {
          alert(
            "Please fill in all required fields for the investment holding."
          );
          return;
        }
        const currentValue = calculateCurrentValue(
          holdingForm.units,
          holdingForm.currentPrice
        );
        const unrealizedGain = calculateUnrealizedGain(
          currentValue,
          holdingForm.totalInvested
        );
        const returnPercentage = calculateReturnPercentage(
          unrealizedGain,
          holdingForm.totalInvested
        );
        const holdingPeriod = calculateHoldingPeriod(
          holdingForm.firstPurchaseDate,
          holdingForm.lastPurchaseDate
        );
        payload = {
          ...holdingForm,
          units: parseFloat(holdingForm.units || "0"),
          currentPrice: parseFloat(holdingForm.currentPrice || "0"),
          avgPurchasePrice: parseFloat(holdingForm.avgPurchasePrice || "0"),
          unrealizedGain,
          returnPercentage,
          holdingPeriod,
          firstPurchaseDate: holdingForm.firstPurchaseDate,
          lastPurchaseDate: holdingForm.lastPurchaseDate,
          totalInvested: parseFloat(holdingForm.totalInvested || "0"),
          operationType: activeTab,
        };
      } else {
        // Validate SIP form
        if (holdings.length === 0) {
          alert("Please add an investment holding first before creating a SIP.");
          return;
        }
        if (
          !sipForm.holdingId ||
          !sipForm.amount ||
          !sipForm.frequency ||
          !sipForm.startDate
        ) {
          alert("Please fill in all required fields for the SIP investment.");
          return;
        }

        payload = {
          ...sipForm,
          amount: parseFloat(sipForm.amount || "0"),
          nextSipDate: sipForm.nextSipDate,
          operationType: activeTab,
        };
      }

      console.log("Submitting payload:", payload); // Debug log

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchPortfolioData();
        setIsAddDialogOpen(false);
        setIsEditing(false);
        setEditingItem(null);
        resetForms();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(
          `Failed to ${isEditing ? "update" : "create"} investment: ${errorData.error}`
        );
      }
    } catch (error) {
      console.error("Error saving investment:", error);
      alert(
        `Error saving investment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleEdit = (
    type: "holding" | "sip",
    item: InvestmentHolding | SIPInvestment
  ) => {
    setIsEditing(true);
    setEditingItem({ type, data: item });
    setActiveTab(type);

    if (type === "holding") {
      const holding = item as InvestmentHolding;
      setHoldingForm({
        name: holding.name,
        type: holding.type,
        units: holding.units?.toString() || "",
        currentPrice: holding.currentPrice?.toString() || "",
        avgPurchasePrice: holding.avgPurchasePrice?.toString() || "",
        firstPurchaseDate: holding.firstPurchaseDate || "",
        lastPurchaseDate: holding.lastPurchaseDate || "",
        totalInvested: holding.totalInvested?.toString() || "",
        fundHouse: holding.fundHouse || "",
        category: holding.category || "",
        riskLevel: holding.riskLevel || "",
      });
    } else {
      const sip = item as SIPInvestment;
      setSipForm({
        holdingId: sip.holdingId,
        amount: sip.amount?.toString() || "",
        frequency: sip.frequency || "",
        startDate: sip.startDate || "",
        nextSipDate: sip.nextSipDate || new Date().toISOString().slice(0, 10),
        isActive: sip.isActive || true,
        fundName: sip.fundName || "",
      });
    }

    setIsAddDialogOpen(true);
  };

  const handleDelete = async (type: "holding" | "sip", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setIsDeleting(id);
    try {
      const response = await fetch(
        `/api/dashboard/portfolio/${id}?operationType=${type}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchPortfolioData();
      }
    } catch (error) {
      console.error("Error deleting investment:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForms = () => {
    setHoldingForm({
      name: "",
      type: "",
      units: "",
      currentPrice: "",
      avgPurchasePrice: "",
      firstPurchaseDate: "",
      lastPurchaseDate: "",
      totalInvested: "",
      fundHouse: "",
      category: "",
      riskLevel: "",
    });
    setSipForm({
      holdingId: "",
      amount: "",
      frequency: "",
      startDate: new Date().toISOString().slice(0, 10),
      nextSipDate: new Date().toISOString().slice(0, 10),
      isActive: true,
      fundName: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground">
            Track your investments, SIPs, and portfolio performance
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditingItem(null);
                resetForms();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit" : "Add"}{" "}
                {activeTab === "holding"
                  ? "Investment Holding"
                  : "SIP Investment"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update" : "Enter"} the details of your{" "}
                {activeTab === "holding"
                  ? "investment holding"
                  : "SIP investment"}
                .
              </DialogDescription>
            </DialogHeader>

            <div className="flex space-x-2 mb-4">
              <Button
                variant={activeTab === "holding" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("holding")}
              >
                Investment Holding
              </Button>
              <Button
                variant={activeTab === "sip" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("sip")}
                disabled={holdings.length === 0}
                title={
                  holdings.length === 0 ? "Add an investment holding first" : ""
                }
              >
                SIP Investment
                {holdings.length === 0 && (
                  <span className="ml-1 text-xs opacity-75">(No holdings)</span>
                )}
              </Button>
            </div>

            <form onSubmit={handleAddInvestment} className="space-y-4">
              {activeTab === "holding" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Investment Name *</Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g., HDFC Mid-Cap Opportunities Fund"
                      value={holdingForm.name}
                      onChange={e =>
                        setHoldingForm({ ...holdingForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={holdingForm.type}
                        onValueChange={value =>
                          setHoldingForm({ ...holdingForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {investmentTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type
                                .replace("_", " ")
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select
                        value={holdingForm.riskLevel}
                        onValueChange={value =>
                          setHoldingForm({ ...holdingForm, riskLevel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          {riskLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="units">Number of Units/Shares *</Label>
                      <Input
                        id="units"
                        type="number"
                        step="0.0001"
                        required
                        placeholder="0.0000"
                        value={holdingForm.units}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            units: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentPrice">
                        Current Price per Unit *
                      </Label>
                      <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={holdingForm.currentPrice}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            currentPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avgPurchasePrice">
                        Average Purchase Price *
                      </Label>
                      <Input
                        id="avgPurchasePrice"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={holdingForm.avgPurchasePrice}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            avgPurchasePrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalInvested">Total Invested *</Label>
                      <Input
                        id="totalInvested"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={holdingForm.totalInvested}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            totalInvested: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fundHouse">Fund House</Label>
                      <Input
                        id="fundHouse"
                        placeholder="e.g., HDFC Mutual Fund"
                        value={holdingForm.fundHouse}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            fundHouse: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Mid Cap, Large Cap"
                        value={holdingForm.category}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstPurchaseDate">
                        First Purchase Date *
                      </Label>
                      <Input
                        id="firstPurchaseDate"
                        type="date"
                        required
                        value={holdingForm.firstPurchaseDate}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            firstPurchaseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastPurchaseDate">
                        Last Purchase Date *
                      </Label>
                      <Input
                        id="lastPurchaseDate"
                        type="date"
                        required
                        value={holdingForm.lastPurchaseDate}
                        onChange={e =>
                          setHoldingForm({
                            ...holdingForm,
                            lastPurchaseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Value</Label>
                      <Input
                        value={formatINR(
                          calculateCurrentValue(
                            holdingForm.units,
                            holdingForm.currentPrice
                          )
                        )}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unrealized Gain/Loss</Label>
                      <Input
                        value={formatINR(
                          calculateUnrealizedGain(
                            calculateCurrentValue(
                              holdingForm.units,
                              holdingForm.currentPrice
                            ),
                            holdingForm.totalInvested
                          )
                        )}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Return Percentage</Label>
                      <Input
                        value={calculateReturnPercentage(
                          calculateUnrealizedGain(calculateCurrentValue(holdingForm.units, holdingForm.currentPrice), holdingForm.totalInvested),
                          holdingForm.totalInvested
                        ).toFixed(2) + "%"}
                        readOnly
                        className={
                          calculateReturnPercentage(
                            calculateUnrealizedGain(calculateCurrentValue(holdingForm.units, holdingForm.currentPrice), holdingForm.totalInvested),
                            holdingForm.totalInvested
                          ) > 1000 ? "border-yellow-500 bg-yellow-50" : ""
                        }
                      />
                      {calculateReturnPercentage(
                        calculateUnrealizedGain(calculateCurrentValue(holdingForm.units, holdingForm.currentPrice), holdingForm.totalInvested),
                        holdingForm.totalInvested
                      ) > 1000 && (
                          <p className="text-xs text-yellow-600">
                            ⚠️ Very high return percentage. Please verify your values.
                          </p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <Label>Holding Period</Label>
                      <Input
                        value={calculateHoldingPeriod(holdingForm.firstPurchaseDate, holdingForm.lastPurchaseDate)}
                        readOnly
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="holdingId">Investment Holding *</Label>
                    {holdings.length === 0 ? (
                      <div className="text-sm text-red-600 p-2 border border-red-200 rounded">
                        No investment holdings found. Please add an investment
                        holding first before creating a SIP.
                      </div>
                    ) : (
                      <Select
                        value={sipForm.holdingId}
                        onValueChange={value =>
                          setSipForm({ ...sipForm, holdingId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select holding" />
                        </SelectTrigger>
                        <SelectContent>
                          {holdings.map(holding => (
                            <SelectItem key={holding.id} value={holding.id}>
                              {holding.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundName">SIP Fund Name</Label>
                    <Input
                      id="fundName"
                      placeholder="e.g., HDFC Mid-Cap SIP"
                      value={sipForm.fundName}
                      onChange={e =>
                        setSipForm({ ...sipForm, fundName: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={sipForm.amount}
                        onChange={e =>
                          setSipForm({ ...sipForm, amount: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency *</Label>
                      <Select
                        value={sipForm.frequency}
                        onValueChange={value =>
                          setSipForm({ ...sipForm, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {sipFrequencies.map(freq => (
                            <SelectItem key={freq} value={freq}>
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={sipForm.startDate}
                      onChange={e =>
                        setSipForm({ ...sipForm, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextSipDate">Next SIP Date</Label>
                    <Input
                      id="nextSipDate"
                      type="date"
                      value={sipForm.nextSipDate}
                      onChange={e =>
                        setSipForm({ ...sipForm, nextSipDate: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update" : "Add"}{" "}
                  {activeTab === "holding" ? "Holding" : "SIP"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatINR(totalPortfolioValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReturns >= 0 ? "+" : ""}
              {formatINR(totalReturns)} ({totalReturnsPercentage.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invested
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Principal amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            {totalReturns >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatINR(totalReturns)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReturnsPercentage.toFixed(2)}% return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active SIPs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatINR(totalSIPAmount)}/month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Holdings - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Holdings</CardTitle>
            <CardDescription>Your current investment positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No investment holdings found. Add your first investment to get
                  started.
                </div>
              ) : (
                holdings.map(holding => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{holding.name}</h3>
                        {holding.type && (
                          <Badge variant="outline" className="text-xs">
                            {holding.type.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {holding.fundHouse && `${holding.fundHouse}`}
                        {holding.category && ` • ${holding.category}`}
                        {holding.riskLevel && ` • ${holding.riskLevel}`}
                        {holding.units && typeof holding.units === 'number' &&
                          ` • ${holding.units.toFixed(4)} units`}
                        {holding.currentPrice && typeof holding.currentPrice === 'number' &&
                          ` • ₹${holding.currentPrice}/unit`}
                        {holding.holdingPeriod && ` • ${holding.holdingPeriod}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatINR(holding.currentValue)}
                      </div>
                      <div
                        className={`text-sm ${holding.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {holding.returns >= 0 ? "+" : ""}
                        {formatINR(holding.returns)} (
                        {holding.returnsPercentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("holding", holding)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("holding", holding.id)}
                        disabled={isDeleting === holding.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {isDeleting === holding.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* SIPs */}
        <Card>
          <CardHeader>
            <CardTitle>SIP Investments</CardTitle>
            <CardDescription>Your Systematic Investment Plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sipInvestments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No SIP investments found. Start your first SIP to begin
                  systematic investing.
                </div>
              ) : (
                sipInvestments.map(sip => (
                  <div
                    key={sip.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {sip.holding?.name || "Unknown Holding"}
                        </h3>
                        <Badge variant={sip.isActive ? "default" : "secondary"}>
                          {sip.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sip.fundName && `${sip.fundName} • `}
                        {formatINR(sip.amount)} • {sip.frequency} • Started{" "}
                        {new Date(sip.startDate).toLocaleDateString()}
                        {sip.nextSipDate &&
                          ` • Next: ${new Date(sip.nextSipDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatINR(sip.totalInvested)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sip.totalUnits.toFixed(2)} units
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("sip", sip)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete("sip", sip.id)}
                        disabled={isDeleting === sip.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {isDeleting === sip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
