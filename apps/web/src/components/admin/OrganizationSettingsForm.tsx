"use client";

import React, { useState } from "react";
import { Building2, Save, Globe, DollarSign, Calendar, Mail } from "lucide-react";
import { OrganizationProfile } from "../../types/admin";
import { Input, Label, Select, Button } from "../ui";

export interface OrganizationSettingsFormProps {
  profile: OrganizationProfile;
}

export function OrganizationSettingsForm({ profile }: OrganizationSettingsFormProps) {
  const [name, setName] = useState(profile.name);
  const [legalEntity, setLegalEntity] = useState(profile.legalEntity);
  const [industry, setIndustry] = useState(profile.industry);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [currency, setCurrency] = useState(profile.primaryCurrency);
  const [fiscalYear, setFiscalYear] = useState(profile.fiscalYearStart);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Organization branding & profile settings updated successfully.");
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">Organization Branding & Platform Configuration</h3>
        </div>
        <Button type="submit" loading={saving} variant="primary" className="text-xs h-8 px-3">
          <Save className="w-3.5 h-3.5 mr-1" /> Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <Label required>Organization Display Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs" required />
        </div>
        <div>
          <Label required>Legal Corporate Entity</Label>
          <Input value={legalEntity} onChange={(e) => setLegalEntity(e.target.value)} className="text-xs" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <Label>Industry Domain</Label>
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="text-xs" />
        </div>
        <div>
          <Label>Primary Currency</Label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="text-xs">
            <option value="USD ($)">USD ($)</option>
            <option value="EUR (€)">EUR (€)</option>
            <option value="GBP (£)">GBP (£)</option>
          </Select>
        </div>
        <div>
          <Label>Timezone</Label>
          <Select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="text-xs">
            <option value="UTC-05:00 (US Eastern Time)">UTC-05:00 (US Eastern Time)</option>
            <option value="UTC+00:00 (London GMT)">UTC+00:00 (London GMT)</option>
            <option value="UTC+01:00 (Central European)">UTC+01:00 (Central European)</option>
          </Select>
        </div>
      </div>
    </form>
  );
}
