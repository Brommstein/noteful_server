BEGIN;

INSERT INTO note (note_name, content, assigned_folder)
VALUES
('One', 'You are like a dream come true', 1),
('Two', 'Just wanna be with you', 2),
('Three', 'Girl, it is plain to see', 3),
('Four', 'Repeat Steps 1-3', 4),
('Five', 'Make you fall in love with me', 1);

COMMIT;