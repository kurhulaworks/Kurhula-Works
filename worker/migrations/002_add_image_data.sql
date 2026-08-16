-- 002_add_image_data.sql
-- Add a 'data' column to store base64-encoded image data when R2 is not available.

ALTER TABLE images ADD COLUMN data TEXT;
