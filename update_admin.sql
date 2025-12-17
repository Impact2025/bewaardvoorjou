-- Update user to admin status
UPDATE "user"
SET is_admin = true
WHERE email = 'vincent@stichtingphilia.nl';
