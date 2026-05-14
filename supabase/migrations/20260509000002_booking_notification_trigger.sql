-- Migration: 20260509000002_booking_notification_trigger.sql
-- Wires a PostgreSQL trigger to invoke the send-notification edge function
-- whenever a booking_request status changes to 'accepted', 'completed', or 'cancelled'.
-- This is a server-side safety net in addition to the frontend notification calls.

-- Create the trigger function (requires pg_net extension for HTTP calls)
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT;
BEGIN
  -- Only fire on status changes (not other column updates)
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Only notify on meaningful status transitions
    IF NEW.status IN ('accepted', 'completed', 'cancelled') THEN
      edge_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification';
      
      -- Use pg_net if available for async HTTP call
      BEGIN
        PERFORM net.http_post(
          url := edge_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
            'type', 'booking_update',
            'record', jsonb_build_object(
              'user_name', NEW.user_name,
              'user_phone', COALESCE(NEW.user_phone, ''),
              'provider_name', COALESCE(NEW.provider_name, ''),
              'preferred_date', NEW.preferred_date,
              'preferred_time', NEW.preferred_time,
              'status', NEW.status
            )
          )::text
        );
      EXCEPTION WHEN OTHERS THEN
        -- pg_net may not be installed; silently skip
        RAISE NOTICE 'notify_booking_status_change: pg_net not available — %', SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (idempotent)
DROP TRIGGER IF EXISTS trg_booking_status_notify ON public.booking_requests;
CREATE TRIGGER trg_booking_status_notify
  AFTER UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_status_change();

-- Also create a trigger for new partner registrations
CREATE OR REPLACE FUNCTION public.notify_new_partner_registration()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT;
BEGIN
  edge_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification';
  
  BEGIN
    PERFORM net.http_post(
      url := edge_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', 'partner_registration_new',
        'record', jsonb_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'phone', NEW.phone,
          'specialty', COALESCE(NEW.specialty, ''),
          'bmdc_no', COALESCE(NEW.bmdc_no, ''),
          'district', COALESCE(NEW.district, '')
        )
      )::text
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'notify_new_partner_registration: pg_net not available — %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_partner_registration_notify ON public.partner_registrations;
CREATE TRIGGER trg_partner_registration_notify
  AFTER INSERT ON public.partner_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_partner_registration();
