# FAVR App
[Live Demo](https://favr-app.kramseyart.vercel.app/)
[Client Repo](https://github.com/KRamseyArt/23.4_FAVR-Client)

#### Tech Used:
- PostgreSQL
- Express
- ReactJS
- NodeJS
- CSS

#### Summary:
- The landing page displays an informational overview about how to use the application.
![Landing Page Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/1_Landing.jpg)

- User is able to create a new ccount by submitting a unique username, along with an email address and validated password.
![Sign Up Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/2_SignUp.jpg)
![Log In Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/3_LogIn.jpg)

- Once logged in, user is directed to Favors page to view list of their current to-do list, as well as an aggregate list of favors they have tasked to other users
- User can create new favors, to send to others, delete favors they've assigned to others, and mark favors on their personal to-do list as 'completed' or 'cancelled'
![Favors Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/4_Favors.jpg)
![Create Favor Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/5_NewFavor.jpg)

- User can review statistics on their personal account, as well as customize a header image and about_me section
![Profile Page Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/6_ProfilePage.jpg)
![Edit Profile Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/7_EditProfile.jpg)

- Visitors can view information about the app's creator by clicking the button in the bottom-right corner of all pages at any time
![About The Author Screenshot](https://github.com/KRamseyArt/23.4_FAVR-Client/blob/master/Screenshots/8_AboutAuthor.jpg)

# API Documentation:
- [Live API](https://radiant-wildwood-06130.herokuapp.com/)
#### Users
- (/)
  - GET: Returns a list of all current users registered
  - POST: Create new user with params `{ email, username, password }`
- (/:userId)
  - GET: Return a single user
  - PATCH: Edit `{  about_me, profile_img, date_modified }` of a single user, given a specific ID and valid authentication
  - DELETE: Remove a user from the database given a specific user ID and valid authentication
- (/:userId/favors)
  - GET: Return all Favors assigned to a user, given a specific user ID
  - POST: Add a new Favor to a user's collection with params `{ favor_title, favor_content, to_user_id, from_user_id }`
#### Favors
- (/)
  - GET: Returns all Favors stored in the database
  - POST: Add a Favor to the database with params `{ favor_title, favor_content, to_user_id, from_user_id }`
- (/:favorId)
  - GET: Return a specific Favor, given a specific Favor ID
  - PATCH: Edit a specific Favor with params `{ completed, cancelled, end_date }`, given a specific Favor ID and valid authentication
  - DELETE: Remove a specific Favor from the database, given a specific Favor ID and valid authentication