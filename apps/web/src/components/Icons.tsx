type IconProps = { size?: number; className?: string }

export function SearchIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
export function PinIcon({ size = 18, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function BriefcaseIcon({ size = 18, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function CalendarIcon({ size = 18, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function ArrowIcon({ size = 18, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function UploadIcon({ size = 22, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function CheckIcon({ size = 18, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function HomeIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 11 9-8 9 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10v10h14V10M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function PeopleIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a2.5 2.5 0 0 1 0 5M17 14c2.2.4 3.5 2.2 3.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
}
export function TargetIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>
}
export function ChartIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}
export function SparklesIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 3l.6 1.4L7 5l-1.4.6L5 7l-.6-1.4L3 5l1.4-.6L5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
}
export function GearIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M19 13.5v-3l-2-.6a7 7 0 0 0-.6-1.4l1-1.8-2.1-2.1-1.8 1A7 7 0 0 0 12 5l-.5-2h-3L8 5a7 7 0 0 0-1.5.6l-1.8-1-2.1 2.1 1 1.8A7 7 0 0 0 3 10l-2 .5v3l2 .5a7 7 0 0 0 .6 1.5l-1 1.8 2.1 2.1 1.8-1A7 7 0 0 0 8 19l.5 2h3l.5-2a7 7 0 0 0 1.5-.6l1.8 1 2.1-2.1-1-1.8A7 7 0 0 0 17 14l2-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
}
export function LogoutIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function PlusIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
}
export function EyeIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function MailIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
}
export function LockIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7"/></svg>
}
export function FileIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 2h8l4 4v16H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 2v5h5M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
}
export function ChevronRightIcon({ size = 20, className = '' }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
