BEGIN;

TRUNCATE
  favors,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password, about_me)
VALUES
  (
    'Demo',
    'demo@test.com',
    'Testing123!',
    'This is a sample "About Me" section. Write something nice!'
  ),
  (
    'Sample',
    'sample@test.com',
    'Testing123!',
    'Here is another sample "About Me" section.'
  ),
  (
    'Test',
    'test@test.com',
    'Testing123!',
    'This "About Me" section should be very interesting!'
  );

INSERT INTO favors (from_user_id, to_user_id, favor_title, favor_content)
VALUES
  (
    2,
    1,
    'Demo Favor 1',
    'This Favor comes from user "Sample"'
  ),
  (
    3,
    1,
    'Demo Favor 2',
    'This favor comes from user "Test"'
  ),
  (
    3,
    1,
    'Demo Favor 3',
    'This is the second favor asked from user "Test"'
  ),
  (
    2,
    1,
    'Demo Favor 4',
    'This is the second favor asked from user "Sample"'
  ),
  (
    1,
    2,
    'Sample Favor 1',
    'This favor is asked from user "Demo" to user "Sample"'
  ),
  (
    1,
    2,
    'Sample Favor 2',
    'This is the second favor asked of user "Sample" by user "Demo"'
  ),
  (
    3,
    2,
    'Sample Favor 3',
    'This is the a favor asked from user "Test" of user "Sample"'
  ),
  (
    1,
    3,
    'Test Favor 1',
    'User "Demo" asked this favor from user "Test"'
  ),
  (
    2,
    3,
    'Test Favor 2',
    'User "Sample" asked this favor from user "Test"'
  );

COMMIT;