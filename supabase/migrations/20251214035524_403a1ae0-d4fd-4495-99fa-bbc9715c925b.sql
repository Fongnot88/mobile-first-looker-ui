-- Add user info@c2tech.app access to moisture meter mm000001
INSERT INTO user_device_access (user_id, device_code, created_by)
VALUES (
  'fdefffa1-2d9a-46f6-a2c1-9c61ddd7b23f',  -- info@c2tech.app
  'mm000001',                               -- moisture meter device
  'bae7bf0b-2aa4-4f8d-a108-4aebdb388695'   -- admin user
)
ON CONFLICT DO NOTHING;