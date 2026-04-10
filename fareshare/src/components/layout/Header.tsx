import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/server';
import { getInitials } from '@/lib/utils';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initials = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    initials = profile ? getInitials(profile.display_name) : '??';
  }

  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-border">
      <h1 className="font-heading text-[24px] tracking-[2px] text-text-primary">
        FARESHARE
      </h1>
      {initials ? (
        <Avatar initials={initials} size="sm" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-accent" />
      )}
    </header>
  );
}
