-- Auto-create a default profile row whenever a new user is inserted into auth.users.
-- Covers both email/password signups and OAuth providers (Google, etc.).
-- The ON CONFLICT DO NOTHING makes this safe to run even if the row already exists.
--
-- AG: run this via Supabase MCP. Once deployed, new signups will always have a
-- profile row before the client-side fetchProfile call returns.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, plan_tier)
  VALUES (new.id, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
