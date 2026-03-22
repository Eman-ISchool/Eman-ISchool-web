import { CSSProperties, ReactNode } from 'react';

function Frame({
  children,
  className = '',
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({
  children,
  width = '100%',
  height = '100%',
}: {
  children?: ReactNode;
  width?: string | number;
  height?: string | number;
}) {
  return <Frame style={{ width, height }}>{children}</Frame>;
}

export function AreaChart({ children }: { children?: ReactNode }) {
  return <Frame className="h-full w-full">{children}</Frame>;
}

export function Area() {
  return null;
}

export function XAxis() {
  return null;
}

export function YAxis() {
  return null;
}

export function CartesianGrid() {
  return null;
}

export function Tooltip() {
  return null;
}

export function PieChart({ children }: { children?: ReactNode }) {
  return <Frame className="flex h-full w-full items-center justify-center">{children}</Frame>;
}

export function Pie({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50">
      {children}
    </div>
  );
}

export function Cell() {
  return null;
}
