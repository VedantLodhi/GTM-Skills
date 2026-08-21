import {
  Target,
  Users,
  Shield,
  Compass,
  ListChecks,
  Mail,
  MessageCircle,
  HelpCircle,
  ShieldQuestion,
  Calendar,
  Presentation,
  Handshake,
  DollarSign,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  shield: Shield,
  compass: Compass,
  "list-checks": ListChecks,
  mail: Mail,
  "message-circle": MessageCircle,
  "help-circle": HelpCircle,
  "shield-question": ShieldQuestion,
  calendar: Calendar,
  presentation: Presentation,
  handshake: Handshake,
  "dollar-sign": DollarSign,
  "alert-triangle": AlertTriangle,
  "heart-pulse": HeartPulse,
  "trending-up": TrendingUp,
};

export function SkillIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon className={className} />;
}
