interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-bg relative">
      {children}
    </div>
  );
}
