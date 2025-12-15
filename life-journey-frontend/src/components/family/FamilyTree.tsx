"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { listFamilyMembers } from "@/lib/family-client";
import type { FamilyMember } from "@/lib/family-types";
import { ROLE_LABELS } from "@/lib/family-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";
import {
  User,
  Users,
  Heart,
  Crown,
  UserCheck,
  UserX,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface FamilyTreeProps {
  journeyId: string;
  className?: string;
}

interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  level: number;
  children: TreeNode[];
  parent?: TreeNode;
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  spouse: Heart,
  child: User,
  parent: Users,
  sibling: UserCheck,
  grandchild: User,
  extended: Users,
  friend: User,
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-100 border-amber-300 text-amber-800",
  spouse: "bg-pink-100 border-pink-300 text-pink-800",
  child: "bg-blue-100 border-blue-300 text-blue-800",
  parent: "bg-green-100 border-green-300 text-green-800",
  sibling: "bg-purple-100 border-purple-300 text-purple-800",
  grandchild: "bg-emerald-100 border-emerald-300 text-emerald-800",
  extended: "bg-slate-100 border-slate-300 text-slate-800",
  friend: "bg-orange-100 border-orange-300 text-orange-800",
};

export function FamilyTree({ journeyId, className }: FamilyTreeProps) {
  const { session } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!session?.token || !journeyId) return;

    try {
      setIsLoading(true);
      const data = await listFamilyMembers(session.token, journeyId);
      setMembers(data.members);
      buildFamilyTree(data.members);
    } catch (err) {
      logger.error("Failed to fetch family members", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, journeyId]);

  const buildFamilyTree = (members: FamilyMember[]) => {
    // Find the owner (root)
    const owner = members.find(m => m.role === 'owner');
    if (!owner) return;

    // Build hierarchical structure based on relationships
    const nodes: TreeNode[] = [];
    const processed = new Set<string>();

    const createNode = (member: FamilyMember, level: number, x: number, y: number): TreeNode => {
      const node: TreeNode = {
        member,
        x,
        y,
        level,
        children: [],
      };

      processed.add(member.id);

      // Add children based on relationships
      const children = members.filter(m =>
        !processed.has(m.id) &&
        (m.role === 'child' || m.role === 'spouse' && level === 0)
      );

      children.forEach((child, index) => {
        const childNode = createNode(child, level + 1, x + (index - children.length / 2) * 150, y + 120);
        childNode.parent = node;
        node.children.push(childNode);
      });

      return node;
    };

    const rootNode = createNode(owner, 0, 400, 50);
    nodes.push(rootNode);

    setTree(nodes);
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isLoading) {
    return <FamilyTreeSkeleton />;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Familieboom</h3>
          <span className="text-sm text-slate-500">({members.length} leden)</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-500 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tree Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            className="relative bg-gradient-to-br from-slate-50 to-blue-50 min-h-[500px] overflow-hidden"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center top',
            }}
          >
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {tree.map(node =>
                node.children.map(child => (
                  <line
                    key={`${node.member.id}-${child.member.id}`}
                    x1={node.x}
                    y1={node.y + 40}
                    x2={child.x}
                    y2={child.y - 10}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray={node.level === 0 ? "none" : "5,5"}
                  />
                ))
              )}
            </svg>

            {/* Tree nodes */}
            {tree.map(node => (
              <FamilyTreeNode
                key={node.member.id}
                node={node}
                isSelected={selectedMember?.id === node.member.id}
                onSelect={setSelectedMember}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected member details */}
      {selectedMember && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2",
                ROLE_COLORS[selectedMember.role] || ROLE_COLORS.other
              )}>
                {(() => {
                  const Icon = ROLE_ICONS[selectedMember.role] || User;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{selectedMember.name}</h4>
                <p className="text-sm text-slate-600">
                  {ROLE_LABELS[selectedMember.role] || 'Familielid'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedMember.invite_status === 'accepted' ? 'Actief lid' : 'Uitnodiging verzonden'}
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => setSelectedMember(null)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FamilyTreeNodeProps {
  node: TreeNode;
  isSelected: boolean;
  onSelect: (member: FamilyMember) => void;
}

function FamilyTreeNode({ node, isSelected, onSelect }: FamilyTreeNodeProps) {
  const { member } = node;
  const Icon = ROLE_ICONS[member.role] || User;

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 cursor-pointer transition-all duration-200",
        isSelected && "scale-110 z-10"
      )}
      style={{ left: node.x, top: node.y }}
      onClick={() => onSelect(member)}
    >
      <div className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
        ROLE_COLORS[member.role] || ROLE_COLORS.other,
        isSelected ? "shadow-lg ring-2 ring-orange-300" : "hover:shadow-md",
        member.invite_status !== 'accepted' && "opacity-60"
      )}>
        <div className="relative">
          <Icon className="h-8 w-8" />
          {member.invite_status !== 'accepted' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
          )}
        </div>

        <div className="text-center">
          <div className="font-medium text-sm text-slate-900 truncate max-w-20">
            {member.name}
          </div>
          <div className="text-xs text-slate-600">
            {ROLE_LABELS[member.role]?.split(' ')[0] || 'Lid'}
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyTreeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FamilyTree;