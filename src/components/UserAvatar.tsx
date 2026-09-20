import React from 'react';
import {
  Shield,
  Crown,
  Skull,
  Wand2,
  Scroll,
  Flame,
  User,
  Ghost,
  Swords,
  Dice6,
} from 'lucide-react';
import { FlamingD20Logo } from './FlamingD20Logo';
import { UserProfile } from '../types';

interface UserAvatarProps {
  avatarId?: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const AVATAR_OPTIONS = [
  { id: 'd20', label: 'D20 Mítico', icon: 'd20' },
  { id: 'wizard', label: 'Mago Arcano', icon: Wand2 },
  { id: 'warrior', label: 'Guerreiro', icon: Swords },
  { id: 'shield', label: 'Guardião', icon: Shield },
  { id: 'crown', label: 'Mestre da Coroa', icon: Crown },
  { id: 'flame', label: 'Chama Eterna', icon: Flame },
  { id: 'skull', label: 'Necromante', icon: Skull },
  { id: 'rogue', label: 'Ladino Fantasma', icon: Ghost },
  { id: 'scroll', label: 'Cronista', icon: Scroll },
];

export const COLOR_OPTIONS: { id: UserProfile['color']; label: string; border: string; bg: string; text: string; glow: string }[] = [
  { id: 'cyan', label: 'Ciano Arcano', border: 'border-cyan-500/50', bg: 'bg-cyan-500/15', text: 'text-cyan-400', glow: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]' },
  { id: 'purple', label: 'Púrpura Mística', border: 'border-purple-500/50', bg: 'bg-purple-500/15', text: 'text-purple-400', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]' },
  { id: 'amber', label: 'Âmbar Dourado', border: 'border-amber-500/50', bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]' },
  { id: 'emerald', label: 'Verde Druídico', border: 'border-emerald-500/50', bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]' },
  { id: 'rose', label: 'Rubro Sangue', border: 'border-rose-500/50', bg: 'bg-rose-500/15', text: 'text-rose-400', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]' },
  { id: 'indigo', label: 'Índigo Estelar', border: 'border-indigo-500/50', bg: 'bg-indigo-500/15', text: 'text-indigo-400', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.35)]' },
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarId = 'd20',
  color = 'cyan',
  size = 'md',
  className = '',
  showGlow = false,
}) => {
  const colorDef = COLOR_OPTIONS.find((c) => c.id === color) || COLOR_OPTIONS[0];

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  const iconSizes = {
    xs: 11,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  }[size];

  // If avatarId is an external or data URL image
  if (avatarId.startsWith('http://') || avatarId.startsWith('https://') || avatarId.startsWith('data:image/')) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden border ${colorDef.border} ${showGlow ? colorDef.glow : ''} ${sizeClasses} ${className}`}
      >
        <img
          src={avatarId}
          alt="Avatar"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // D20 Avatar special rendering
  if (avatarId === 'd20') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl border ${colorDef.border} ${colorDef.bg} ${showGlow ? colorDef.glow : ''} ${sizeClasses} ${className}`}
      >
        <FlamingD20Logo size={iconSizes + 4} showGlow={showGlow} />
      </div>
    );
  }

  // Render appropriate Icon
  let IconComponent = User;
  if (avatarId === 'wizard') IconComponent = Wand2;
  else if (avatarId === 'warrior') IconComponent = Swords;
  else if (avatarId === 'shield') IconComponent = Shield;
  else if (avatarId === 'crown') IconComponent = Crown;
  else if (avatarId === 'flame') IconComponent = Flame;
  else if (avatarId === 'skull') IconComponent = Skull;
  else if (avatarId === 'rogue') IconComponent = Ghost;
  else if (avatarId === 'scroll') IconComponent = Scroll;
  else if (avatarId === 'dice') IconComponent = Dice6;

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl border ${colorDef.border} ${colorDef.bg} ${colorDef.text} ${showGlow ? colorDef.glow : ''} ${sizeClasses} ${className}`}
    >
      <IconComponent size={iconSizes} />
    </div>
  );
};
