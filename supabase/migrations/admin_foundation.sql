-- 1. Add app_role to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'app_role') THEN
    ALTER TABLE public.profiles ADD COLUMN app_role text DEFAULT 'user';
  END IF;
END $$;

-- 2. Create system_logs table for observability
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL DEFAULT 'system',
  severity text NOT NULL DEFAULT 'info',
  action text,
  message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Admins only can view logs
CREATE POLICY "Admins can view system logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'admin'
    )
  );

-- 5. System/Users can insert logs (to report errors)
CREATE POLICY "Anyone can insert logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (true);
