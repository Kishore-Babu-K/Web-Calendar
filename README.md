# 📅 Interactive 3D Wall Calendar

A visually rich, interactive **3D wall calendar component** built using **Next.js, React, and Tailwind CSS**, designed to replicate the feel of a real-life hanging calendar with modern UI/UX enhancements.

---

## ✨ Features

### 🎨 Realistic Wall Calendar UI

* 3D **hanging calendar design** with:

  * Nail and binding hoops
  * Paper-like layout and depth
* Dynamic shadows and layered depth for realism
* Subtle **page corner flutter animation** for natural feel

---

### 📖 Page Flip Navigation

* Smooth **3D page flip animation** between months
* Supports:

  * Click interaction (right side)
  * Swipe gesture (mobile)
* Includes subtle **page flip sound effect**

---

### 📅 Date Range Selection

* Double-click to select **start date**
* Click another date to select **end date**
* Visual enhancements:

  * Connected **capsule-style range highlight**
  * Soft gradient fill
  * Glow/elevation effect
  * Hover preview for range selection
  * Smooth selection animations

---

### 📝 Notes & Event System

#### 📌 Single-Day Notes

* Click a date to:

  * View existing note
  * Add or edit note
* Subtle highlight for dates with notes

---

#### 📆 Range-Based Notes

* Attach notes to selected date ranges
* Highlight entire range visually
* Click to view detailed notes and edit

---

#### ⏳ Countdown Feature

* Supports countdown events across date ranges
* Features:

  * Automatic **date progression tracking**
  * Red **strikethrough** for completed days
  * Faded past dates
  * “Days left” indicator

---

#### 🚨 Event & Deadline Indicators

* Visual markers on dates:

  * 🔴 Deadlines (highlight + subtle pulse)
  * 🔵 Events (color-coded indicators)
* Clean corner-based UI for minimal clutter

---

### 🗒 Monthly Notes Section

* Dedicated **aesthetic notes area**
* Features:

  * Handwriting-style font
  * Bullet points
  * Editable lines (double-click to edit)
* Designed to feel casual and natural

---

### 📱 Fully Responsive

* Desktop:

  * Full 3D layout and interactions
* Mobile:

  * Optimized layout
  * Touch-friendly gestures

---

## 🧱 Tech Stack

* **Next.js (App Router)**
* **React (TypeScript)**
* **Tailwind CSS**
* CSS Animations & Transforms (for 3D effects)

---

## 📂 Project Structure

```plaintext
src/
├── components/
│   ├── calendar/
│   │   ├── Calendar.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── DayCell.tsx
│   │   ├── PageFlipWrapper.tsx
│   │   ├── NotesPanel.tsx
│
├── hooks/
│   ├── useDateRange.ts
│   ├── useNotesManager.ts
│
├── utils/
│   ├── calendar.ts
│
├── types/
│   ├── index.ts
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd calendar-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open:
👉 http://localhost:3000

---

## 💾 Data Persistence

* Uses **localStorage** to store:

  * Notes
  * Date ranges
  * Events and countdown data

No backend or API is required.

---

## 🎯 Design Philosophy

This project focuses on:

* Translating a **real-world object** into a digital interface
* Maintaining **visual realism + usability balance**
* Delivering **polished micro-interactions**
* Writing **clean, scalable frontend code**

---

## 🧠 Key Highlights

* Strong emphasis on **UX/UI details**
* Smooth and realistic **3D animations**
* Modular and reusable **component architecture**
* Clean and maintainable codebase

---

## 📹 Demo

Include:

* Date range selection
* Notes system
* Page flip animation
* Responsive behavior

---

## 🙌 Acknowledgment

Inspired by real-world wall calendars and designed to push the boundaries of interactive UI components.
