# AI Copilot Instructions: Real-Time Chat UI Blueprint

## 1. Role & Objective
You are an expert Frontend React Developer. Your objective is to build a highly responsive, multi-pane chatting application interface. 

## 2. Tech Stack & Environment
*   **Framework:** React (.jsx).
*   **Styling:** Tailwind CSS (utility-first, no external CSS files).
*   **Icons:** Lucide-React or Heroicons (standardized SVG icons).

## 3. Strict Coding Constraints (Dos and Don'ts)
*   **DO** use functional components and hooks.
*   **DO** build small, modular components rather than large, monolithic files.
*   **DO** utilize a standard 4-column Flexbox layout to manage the main viewport.
*   **DON'T** use absolute fixed heights or widths that break responsivity; rely on `h-screen`, `w-screen`, and `flex-1`.
*   **DON'T** introduce heavy external dependencies for UI elements (build native Tailwind elements).
*   **DON'T** hardcode custom hex colors; strictly use the Tailwind `slate` and `purple` color palettes.

---

## 4. Global Architecture
The application must fit exactly within the viewport without outer page scrolling.
**Root Wrapper:** `<div className="h-screen w-screen flex overflow-hidden bg-slate-50 text-slate-800">`

### 4.1. NavigationSidebar.jsx (Far Left)
*   **Layout:** `w-20 h-full flex flex-col justify-between items-center py-6 border-r border-slate-100 bg-white`
*   **Top:** App logo container (`w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl`).
*   **Middle:** Vertical nav stack (`flex flex-col gap-6`). Active icons get `text-purple-600 bg-purple-50 rounded-xl p-3`.
*   **Bottom:** User avatar (`w-10 h-10 rounded-full border-2 border-green-400 relative`).

### 4.2. ChatSidebar.jsx (Left-Center)
*   **Layout:** `w-80 h-full flex flex-col border-r border-slate-100 bg-white`
*   **Header:** Standard search input box with a left-aligned search icon (`bg-slate-100/70 border-0 rounded-xl pl-10 pr-4 py-2.5 w-full`).
*   **Filter Row:** Flex container (`overflow-x-auto`) for filter pills: All, Unread, Groups, Mentions. Active pill is `bg-purple-600 text-white`.
*   **Feed (flex-1 overflow-y-auto):** Map through chat objects.
    *   *Chat Card:* `flex items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer`. Includes avatar, name, message preview, and a timestamp or an unread badge (`w-5 h-5 bg-purple-600 text-white rounded-full`).

### 4.3. ChatArea.jsx (Center Main View)
*   **Layout:** `flex-1 h-full flex flex-col bg-slate-50/50`
*   **Header Bar:** `h-20 border-b border-slate-100 bg-white px-6 flex items-center justify-between`. Displays the active contact's name, avatar, and an online indicator.
*   **Message Feed:** `flex-1 overflow-y-auto p-6 space-y-6`.
    *   *Message Bubble:* Avatar on the left. Text box is `bg-purple-600 text-white rounded-2xl rounded-tl-none p-4 max-w-lg`.
    *   *Media Attachments:* Render images with rounded corners beneath the text.
    *   *Reactions:* Absolute-positioned white pills with emojis attached to the message bubble baseline.
*   **Input Bar:** `p-4 bg-white border-t border-slate-100 flex gap-3`. Text input area with embedded action icons (attachment, emoji, voice). Send button is `bg-purple-600 text-white rounded-2xl p-3`.

### 4.4. ProfileSidebar.jsx (Right Pane)
*   **Layout:** `w-80 h-full border-l border-slate-100 bg-white flex flex-col overflow-y-auto`
*   **Identity Header:** Feature area with the user's large avatar, name, and role.
*   **Media Grid:** A 3-column grid (`grid grid-cols-3 gap-2`) previewing shared images as uniform thumbnail squares.
*   **Accordion Actions:** Stacked list items (`flex justify-between p-4 border-b border-slate-50`) for things like 'Starred Messages' and 'Shared Files'.


