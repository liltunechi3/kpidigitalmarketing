-- Auto-create a profile row when someone signs up.
-- The very first user to ever sign up becomes admin + head_digital_marketing (bootstrap).
-- Subsequent users get the role they picked at signup, is_admin = false (admin can promote later).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role public.team_role;
  is_first_user boolean;
begin
  select not exists(select 1 from public.profiles) into is_first_user;

  begin
    chosen_role := coalesce(new.raw_user_meta_data->>'role', 'content_creator')::public.team_role;
  exception when others then
    chosen_role := 'content_creator';
  end;

  insert into public.profiles (id, full_name, role, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first_user then 'head_digital_marketing'::public.team_role else chosen_role end,
    is_first_user
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
