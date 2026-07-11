-- Check EmailEvent records
SELECT id, email_type, status, sent_to, created_at, sent_at, error_message, resend_id
FROM emailevent
ORDER BY created_at DESC
LIMIT 10;

-- Check EmailPreference records  
SELECT user_id, welcome_emails, unsubscribed_all
FROM emailpreference;

-- Check recent user registrations
SELECT id, email, display_name, created_at
FROM "user"
ORDER BY created_at DESC
LIMIT 5;
