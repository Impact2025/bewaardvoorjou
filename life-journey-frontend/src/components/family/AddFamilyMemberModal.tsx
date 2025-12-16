"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FamilyRole, AccessLevel, CreateFamilyMemberRequest } from "@/lib/family-types";
import { ROLE_LABELS, ACCESS_LABELS, ROLE_COLORS } from "@/lib/family-types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Baby,
  Users,
  Home,
  Smile,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";

const RoleIcons: Record<FamilyRole, typeof Heart> = {
  owner: Users,
  spouse: Heart,
  child: Baby,
  parent: Users,
  sibling: Users,
  grandchild: Sparkles,
  extended: Home,
  friend: Smile,
};

const AVAILABLE_ROLES: FamilyRole[] = [
  "spouse",
  "child",
  "parent",
  "sibling",
  "grandchild",
  "extended",
  "friend",
];

const ACCESS_LEVELS: AccessLevel[] = ["full", "selected", "highlights"];

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFamilyMemberRequest) => Promise<void>;
  isLoading?: boolean;
}

export function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddFamilyMemberModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<FamilyRole>("child");
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("selected");
  const [sendInvite, setSendInvite] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vul een naam in");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Vul een geldig e-mailadres in");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        access_level: accessLevel,
        send_invite: sendInvite,
      });

      // Reset form
      setName("");
      setEmail("");
      setRole("child");
      setAccessLevel("selected");
      setSendInvite(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Familielid toevoegen">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="name">Naam</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bijv. Jan de Vries"
            disabled={isLoading}
          />
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@voorbeeld.nl"
            disabled={isLoading}
          />
        </div>

        {/* Role selection */}
        <div className="space-y-2">
          <Label>Relatie</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_ROLES.map((r) => {
              const Icon = RoleIcons[r];
              const colors = ROLE_COLORS[r];
              const isSelected = role === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all text-left",
                    "hover:shadow-sm",
                    isSelected
                      ? cn(colors.bg, "border-current", colors.text)
                      : "bg-white border-slate-200 hover:border-slate-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-1",
                      isSelected ? colors.text : "text-slate-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? colors.text : "text-slate-700",
                    )}
                  >
                    {ROLE_LABELS[r]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Access level selection */}
        <div className="space-y-2">
          <Label>Toegangsniveau</Label>
          <div className="space-y-2">
            {ACCESS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setAccessLevel(level)}
                disabled={isLoading}
                className={cn(
                  "w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between",
                  accessLevel === level
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300 bg-white",
                )}
              >
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      accessLevel === level ? "text-teal-700" : "text-slate-700",
                    )}
                  >
                    {ACCESS_LABELS[level]}
                  </p>
                  <p className="text-sm text-slate-500">
                    {level === "full" && "Kan alle hoofdstukken en media bekijken"}
                    {level === "selected" && "Je kiest welke hoofdstukken zichtbaar zijn"}
                    {level === "highlights" && "Kan alleen gemarkeerde momenten zien"}
                  </p>
                </div>
                {accessLevel === level && (
                  <Check className="h-5 w-5 text-teal-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Send invite checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <div>
            <span className="font-medium text-slate-900">
              Verstuur direct een uitnodiging
            </span>
            <p className="text-sm text-slate-500">
              Er wordt een e-mail gestuurd met een link om de uitnodiging te accepteren
            </p>
          </div>
        </label>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuleren
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              "Toevoegen"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddFamilyMemberModal;
