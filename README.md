# LofiLand - Music Streaming App

Welcome to **LofiLand**, a cross-platform music streaming application built with **Expo**!

---

## Project Introduction

**LofiLand** is a mobile application designed to provide a **smooth, relaxing, and personalized music listening experience**, with a main focus on **Lofi** and **ambient music**.

The project aims to deliver a **user-friendly interface**, easy navigation, and a personalized experience for music lovers who enjoy calm and relaxing sounds.

---

## Development Team

- **Doan Lan Huong**
- **Phan Huu Loc**

---

## Main Features

LofiLand provides core features that help users enjoy a complete music listening experience.

### Account & User Management

- **Sign Up and Sign In:** Create an account and log in to personalize the user experience.
- **Update Profile Information:** Edit and manage personal user information.
- **Log Out:** Safely sign out of the application.

### Search & Library

- **Advanced Search:** Search for songs by title, artist, or favorite genre.
- **Favorite Songs List:** Create and manage a list of favorite songs.
- **Personal Playlist Creation:** Customize and organize personal music playlists.

### Music Listening Experience

- **Music Playback:** Enjoy smooth music playback with basic controls such as play, pause, and next track.
- **Lyrics Display:** View song lyrics when available.
- **Comments:** Allow users to comment on songs or albums.

---

## Technologies Used

This project is built using the following technologies:

- **Expo:** A framework and platform for building React Native applications.
- **React Native:** A framework for developing cross-platform mobile user interfaces for iOS and Android.
- **Expo Router:** A file-based routing system for Expo and React Native applications.

---

## Getting Started

### 1. Installation

Make sure you have **Node.js** and **npm** or **yarn** installed on your machine.

```bash
# Install dependencies
npm install

# or
yarn install
```

### 2. Start the Application

Run the following command to start the **development server**:

```bash
npx expo start
```

After starting the development server, you can choose one of the following options to open the application:

- **Expo Go:** Quickly open the app on a mobile device using the Expo Go app.
- **Android Emulator:** Run the app on an Android emulator.
- **iOS Simulator:** Run the app on an iOS simulator.
- **Development Build:** Use a custom development build for advanced testing.

> You can start editing the source code inside the **`app/`** directory.  
> This project uses **Expo Router**, which supports file-based routing.

---

## Project Structure

Below is a basic project structure for an Expo Router application:

```bash
LofiLand/
├── app/
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── profile.js
│   ├── search.js
│   ├── playlist.js
│   └── player.js
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── Header.js
│   ├── MusicCard.js
│   ├── PlayerControl.js
│   └── PlaylistItem.js
├── constants/
│   └── colors.js
├── hooks/
│   └── useMusicPlayer.js
├── package.json
└── README.md
```

> The structure may be adjusted depending on the actual development requirements of the project.

---

## Suggested Screens

The application may include the following main screens:

- **Home Screen:** Display recommended songs, playlists, and trending Lofi tracks.
- **Login Screen:** Allow users to sign in to their accounts.
- **Register Screen:** Allow new users to create an account.
- **Search Screen:** Help users search for songs, artists, or genres.
- **Music Player Screen:** Display the current song, playback controls, and lyrics.
- **Playlist Screen:** Allow users to view and manage personal playlists.
- **Favorite Screen:** Display songs saved by the user.
- **Profile Screen:** Allow users to view and update personal information.

---

## Future Improvements

In future versions, LofiLand can be expanded with additional features such as:

- Dark mode and light mode support.
- Offline music playback.
- Music recommendation system.
- User listening history.
- Mood-based playlists.
- Push notifications for new songs or playlists.
- Social sharing features.
- Admin dashboard for managing songs, albums, and users.

---

## Learning Resources

- [Official Expo Documentation](https://docs.expo.dev)
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)

Learn how to build applications for Android, iOS, and Web using JavaScript and React Native.

---

## Thank You for Your Interest in LofiLand

> Turn on your favorite track and relax with us.
