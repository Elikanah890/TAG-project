import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

const PALETTE = [
  'bg-[#7b2a35] text-[#FFD600]',
  'bg-[#1F3A5F] text-white',
  'bg-[#3E5C3E] text-white',
  'bg-[#5B3A29] text-white',
  'bg-[#2B2B2B] text-[#FFD600]',
  'bg-[#4A2B4F] text-white',
];

const getInitials = (name: string): string => {
  const parts = name.replace(/^(adv\.?|mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?|rev\.?|pastor)\s+/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] ?? '');
  return (first + last).toUpperCase();
};

const colorFor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export default function LeaderAvatar({
  name,
  imageUrl,
  className,
  imgClassName,
  initialsClassName,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  imgClassName?: string;
  initialsClassName?: string;
}) {
  const src = resolveMediaUrl(imageUrl);
  return (
    <div className={cn('overflow-hidden rounded-full', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn('flex h-full w-full items-center justify-center font-bold', colorFor(name), initialsClassName)}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
