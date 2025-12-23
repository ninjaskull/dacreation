# 🐛 Bug Report & Analysis

**Application**: Da Creation Events & Decors  
**Module**: Floating Chat & Callback Widgets  
**Date Generated**: December 23, 2025  
**Status**: Bugs Identified & Categorized

---

## 📊 Bug Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 5 | ✅ Fixed |
| 🟡 Important | 2 | ⚠️ Identified |
| **Total** | **7** | - |

---

## 🔴 CRITICAL BUGS (FIXED)

---

### **BUG #1: Callback Form Displays Behind Hidden Button on Mobile**

**Severity**: 🔴 CRITICAL  
**Category**: UI/UX - Widget Visibility  
**Status**: ✅ FIXED

#### **Location**
- **File**: `client/src/components/sales/floating-cta.tsx`
- **Line**: 145 (before fix)
- **Component**: `FloatingCTA` component - Form rendering logic

#### **Detailed Description**
When a user opens the chat widget on mobile, the callback request button is hidden to prevent overlay. However, the callback form itself was NOT hidden. The form was still rendering in the background, creating a visual and interactive conflict.

**Root Cause**: 
The condition for rendering the form was:
```tsx
{isOpen && (  // Only checks if form is open
  <motion.div>
    {/* Callback form renders */}
  </motion.div>
)}
```

This only checks if the form is open (`isOpen`), but does NOT check if the callback button is hidden on mobile (`shouldHideButton`).

#### **Effects on Application**

1. **Visual Confusion**: Users on mobile would see:
   - Chat button hidden ✓
   - But callback form still visible in the background ✗
   - Creates cognitive dissonance about available actions

2. **Interaction Issues**:
   - Form fields might be partially visible behind chat window
   - Users could accidentally interact with hidden form elements
   - Touch targets overlap causing accidental form submissions

3. **Mobile UX Degradation**:
   - Small screens (320px-480px) become even more cramped
   - Both widgets competing for limited screen real estate
   - Users can't dismiss callback form easily

4. **Accessibility Problems**:
   - Screen readers announce hidden form fields
   - Keyboard navigation could trap users in hidden form
   - Tab order becomes confusing with multiple hidden widgets

#### **How to Fix**

**Before (Buggy Code)**:
```tsx
{isOpen && (
  <motion.div>
    {/* Form always renders if open */}
  </motion.div>
)}
```

**After (Fixed Code)**:
```tsx
{isOpen && !shouldHideButton && (
  <motion.div>
    {/* Form only renders if open AND button not hidden */}
  </motion.div>
)}
```

**Implementation Details**:
1. Add the `!shouldHideButton` condition to the form rendering
2. This ensures the form is hidden when:
   - On mobile (`isMobile === true`)
   - AND chat widget is open (`openWidget === "chat"`)
3. The callback button was already hidden in this scenario (controlled by the same condition)
4. Now both button and form are hidden together, preventing overlap

**Verification Steps**:
1. Open browser DevTools and set viewport to mobile (375px width)
2. Click chat button - callback button should disappear
3. Verify callback form is NOT visible behind chat window
4. Inspect the DOM - callback form div should not be in the DOM when hidden

---

### **BUG #2: startNewChat Doesn't Sync Context State**

**Severity**: 🔴 CRITICAL  
**Category**: State Management - Context Synchronization  
**Status**: ✅ FIXED

#### **Location**
- **File**: `client/src/components/sales/chatbot.tsx`
- **Line**: 483 (before fix)
- **Function**: `startNewChat()`

#### **Detailed Description**
When a user finishes a chat conversation and clicks "Start New Chat", the local component state (`isOpen`) gets set to true, but the shared context state (`openWidget`) does NOT get updated. This creates a state mismatch.

**Root Cause**:
```tsx
const startNewChat = () => {
  resetChat();
  setIsOpen(true);  // ❌ Only updates local state
  // Missing: setOpenWidget("chat")
};
```

The function uses `setIsOpen()` directly instead of calling `handleToggleChat()` which updates both the local state AND the context.

#### **Effects on Application**

1. **Mobile Widget Visibility Bug**:
   - User finishes chat on mobile
   - Clicks "Start New Chat"
   - Chat window reopens, BUT callback button doesn't hide
   - Both widgets are visible simultaneously on mobile
   - Violates the mobile-safe interaction pattern

2. **Context State Desynchronization**:
   - `openWidget` context remains as `"none"` while `isOpen` is `true`
   - Second render cycle will behave incorrectly
   - If user opens callback button next, unexpected behavior occurs

3. **Unpredictable User Experience**:
   - Users on mobile see overlapping widgets
   - Can't tell which widget is "active"
   - May tap callback button expecting it to hide (but it doesn't)
   - Frustration and confusion about widget behavior

4. **Cascade Failures**:
   - If user then opens callback button while chat is open, both are visible
   - Context says callback is open, but chat is also visible
   - Multiple visual states conflict with each other

#### **How to Fix**

**Before (Buggy Code)**:
```tsx
const startNewChat = () => {
  resetChat();
  setIsOpen(true);  // ❌ Only local state
};
```

**After (Fixed Code)**:
```tsx
const startNewChat = () => {
  resetChat();
  handleToggleChat(true);  // ✅ Updates both local AND context
};
```

**Implementation Details**:
1. Replace direct `setIsOpen(true)` call with `handleToggleChat(true)`
2. `handleToggleChat()` function:
   ```tsx
   const handleToggleChat = (open: boolean) => {
     setIsOpen(open);                    // Update local state
     setOpenWidget(open ? "chat" : "none");  // Update context state
   };
   ```
3. This ensures both pieces of state stay synchronized
4. All widget visibility logic depends on consistent state

**Verification Steps**:
1. On mobile, start a conversation and submit details
2. Click "Start New Chat" button
3. Verify callback button is hidden while chat is open
4. Use React DevTools to inspect:
   - `isOpen` state in Chatbot component
   - `openWidget` value in FloatingWidgetContext
   - Both should reflect "chat" is active

---

### **BUG #3: Missing Close Button for Callback Widget**

**Severity**: 🔴 CRITICAL  
**Category**: UX - User Control  
**Status**: ✅ FIXED

#### **Location**
- **File**: `client/src/components/sales/floating-cta.tsx`
- **Lines**: 155-165 (before fix)
- **Component**: Callback form header

#### **Detailed Description**
The callback request form has NO explicit close button. The only way to dismiss it was:
1. Submit the form (forces close after 3 seconds)
2. Refresh the page
3. Wait for the widget to auto-hide (doesn't happen)

Users couldn't easily close the form if they changed their mind about requesting a callback.

**Root Cause**:
```tsx
<div className="bg-primary p-4 text-white">
  <div className="flex items-center gap-3">
    {/* Icon and title here */}
  </div>
  {/* ❌ No close button (X icon) */}
</div>
```

The header only had icon + title, but no action button to dismiss.

#### **Effects on Application**

1. **User Frustration**:
   - User opens form accidentally or changes mind
   - No clear way to close it
   - Forced to either submit or reload page
   - Creates negative experience

2. **Form Abandonment**:
   - Users can't dismiss form without submitting
   - May submit incomplete/incorrect data just to close
   - Results in bad callback requests with wrong info
   - Admin team gets spam/unusable requests

3. **Mobile Experience Degradation**:
   - On small screens, form takes up entire viewport
   - Users feel trapped - no obvious exit
   - May close browser tab/app entirely to escape
   - Loss of potential leads

4. **Accessibility Issues**:
   - No keyboard escape mechanism
   - No visible close target for screen readers
   - Users with motor disabilities can't easily close
   - WCAG compliance issues

5. **Design Inconsistency**:
   - Chat widget HAS close button (X in header)
   - Callback form had NO close button
   - Inconsistent patterns confuse users
   - Breaks expected interaction model

#### **How to Fix**

**Before (Buggy Code)**:
```tsx
<div className="bg-primary p-4 text-white">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
      <Phone className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-medium">Request a Call Back</h3>
      <p className="text-xs text-white/80">We'll call you within 30 mins</p>
    </div>
  </div>
  {/* ❌ No close button */}
</div>
```

**After (Fixed Code)**:
```tsx
<div className="bg-primary p-4 text-white flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
      <Phone className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-medium">Request a Call Back</h3>
      <p className="text-xs text-white/80">We'll call you within 30 mins</p>
    </div>
  </div>
  <button
    onClick={handleCloseForm}
    className="text-white hover:bg-white/20 p-1 rounded transition-colors"
    data-testid="floating-cta-close"
  >
    <X className="w-5 h-5" />
  </button>
</div>
```

**Implementation Details**:
1. Change header from flex-col to flex with `justify-between`
2. Add close button (X icon) aligned to right
3. Button calls `handleCloseForm()` which calls `handleToggle(false)`
4. Button has hover state for visual feedback
5. Add `data-testid` for automated testing

**Verification Steps**:
1. Open callback form on desktop/mobile
2. Look for X button in top-right of form header
3. Click the X button
4. Form should close smoothly with animation
5. Callback button should reappear on mobile
6. Verify form is completely hidden (check DOM)

---

### **BUG #4: Context State Never Resets to "None"**

**Severity**: 🔴 CRITICAL  
**Category**: State Management - Context Lifecycle  
**Status**: ✅ FIXED

#### **Location**
- **Files**: 
  - `client/src/components/sales/floating-cta.tsx` (lines 50-53)
  - `client/src/components/sales/chatbot.tsx` (lines 92-95)
- **Functions**: `handleToggle()`, `handleToggleChat()`

#### **Detailed Description**
When a user closes either widget (chat or callback), the shared context state was not being reset. The `openWidget` context was set to either `"chat"` or `"callback"`, but there was no proper cleanup to set it back to `"none"`.

**Root Cause**:
```tsx
// In both components:
const handleToggle = (open: boolean) => {
  setIsOpen(open);
  setOpenWidget(open ? "callback" : "none");  // ✅ This part is correct
};

// But other close paths didn't go through handleToggle:
const resetChat = () => {
  setMessages([]);
  // ... other resets ...
  setIsOpen(false);  // ❌ Doesn't call handleToggleChat
};
```

Not all close paths were calling the synchronization function.

#### **Effects on Application**

1. **Zombie State After Close**:
   - User closes chat widget
   - Local state is false, but context still says `"chat"`
   - If user opens callback button, context says callback should hide chat
   - But chat was already closed, so nothing changes
   - Context becomes "stale"

2. **Incorrect Widget Hiding Logic**:
   - Mobile widget hiding depends on context state
   - If context is wrong, hiding logic fails
   - User sees both widgets visible when they shouldn't be
   - Violates the mobile-safe design pattern

3. **Confusing Behavior on Reconnect**:
   - First time: Open chat → works correctly
   - Close chat → context still says "chat"
   - Open chat again → both widgets try to hide each other
   - Unexpected behavior confuses users

4. **Memory Leak Potential**:
   - Context state holding stale values
   - If component reuses context (other parts of app), gets wrong state
   - Could cause bugs in other features
   - State management becomes unreliable

#### **How to Fix**

**Add Proper Close Handlers**:

In `floating-cta.tsx`:
```tsx
const handleToggle = (open: boolean) => {
  setIsOpen(open);
  setOpenWidget(open ? "callback" : "none");  // ✅ Reset to "none"
};

const handleCloseForm = () => {
  handleToggle(false);  // ✅ Use the proper handler
};
```

In `chatbot.tsx`:
```tsx
const handleToggleChat = (open: boolean) => {
  setIsOpen(open);
  setOpenWidget(open ? "chat" : "none");  // ✅ Reset to "none"
};

const resetChat = () => {
  setMessages([]);
  // ... other resets ...
  handleToggleChat(false);  // ✅ Use handler instead of setIsOpen
};
```

**Key Changes**:
1. All close operations go through the main toggle handler
2. Toggle handlers always set context to appropriate value
3. When closing (open=false), context goes to "none"
4. Ensures single source of truth for widget state

**Verification Steps**:
1. Use React DevTools Context Inspector
2. Open chat → context should be `"chat"`
3. Close chat → context should be `"none"` (not still `"chat"`)
4. Open callback → context should be `"callback"`
5. Close callback → context should be `"none"` (not still `"callback"`)
6. Open chat, then open callback → chat should hide, context should be `"callback"`

---

### **BUG #5: No Escape Key Handler for Widget Dismissal**

**Severity**: 🔴 CRITICAL  
**Category**: UX/Accessibility - Keyboard Support  
**Status**: ✅ FIXED

#### **Location**
- **Files**:
  - `client/src/components/sales/floating-cta.tsx` (before fix)
  - `client/src/components/sales/chatbot.tsx` (before fix)
- **Scope**: Both floating widget components

#### **Detailed Description**
Users couldn't close either widget by pressing the Escape key. This is a standard UX pattern for modals, popovers, and dialogs. Users expect Escape to dismiss overlays.

**Root Cause**:
Neither component had keyboard event handlers to detect and handle the Escape key press.

```tsx
// Before - no keyboard handling
return (
  <div className="floating-widget">
    {/* No onKeyDown handler */}
  </div>
);
```

#### **Effects on Application**

1. **Broken UX Expectations**:
   - Users trained by other apps to press Escape to close modals
   - Escape doesn't work on these widgets
   - Creates frustration ("Is it broken?")
   - Feels unfinished/unprofessional

2. **Accessibility Violations**:
   - WCAG 2.1 Level AA requires escape to close popups
   - Screen reader users rely on standard keyboard patterns
   - Keyboard-only users (motor disabilities) have no escape route
   - App becomes inaccessible for many users

3. **Mobile UX (Indirect)**: 
   - On-screen keyboard doesn't show Escape key
   - But users with external keyboards on tablets can't escape
   - Limited use cases, but still a gap

4. **No Way Out for Some Users**:
   - Power users using keyboard only get stuck
   - Must reach for mouse to find close button
   - Breaks keyboard navigation flow
   - Violates accessibility standards

#### **How to Fix**

**Implementation in floating-cta.tsx**:
```tsx
// Add handler function
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape" && isOpen) {
    handleToggle(false);
  }
};

// Add to wrapper div
return (
  <div className="floating-widget" onKeyDown={handleKeyDown}>
    {/* Widget content */}
  </div>
);
```

**Implementation in chatbot.tsx**:
```tsx
// Add handler function
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape" && isOpen) {
    handleToggleChat(false);
  }
};

// Add to wrapper div
return (
  <div className="floating-widget" onKeyDown={handleKeyDown}>
    {/* Widget content */}
  </div>
);
```

**Key Details**:
1. Check for `e.key === "Escape"` (standard key name)
2. Only close if widget is open (`isOpen === true`)
3. Use the existing toggle handler for consistency
4. Event bubbles up through parent divs to be captured

**Verification Steps**:
1. Open chat widget
2. Press Escape key
3. Chat should close immediately
4. Same for callback widget
5. With DevTools, confirm no errors in console

---

---

## 🟡 IMPORTANT BUGS (Identified, Lower Priority)

---

### **BUG #6: useIsMobile Hook Hydration Mismatch**

**Severity**: 🟡 IMPORTANT  
**Category**: React Hydration - Server/Client Mismatch  
**Status**: ⚠️ Identified (Not Fixed - Low Impact)

#### **Location**
- **File**: `client/src/hooks/use-mobile.tsx`
- **Lines**: 5-19
- **Hook**: `useIsMobile()`

#### **Detailed Description**
The hook returns `undefined` during the initial render (before `useEffect` runs). On subsequent renders, it returns a boolean. This creates a mismatch between what the server would render and what the client renders.

```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  //                                                                    ^^^^^^^^^ 
  // Initial state is undefined

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile  // Returns false when undefined
}
```

#### **Effects on Application**

1. **Conditional Rendering Mismatch**:
   - Code checks `if (isMobile && openWidget === "chat")`
   - First render: `isMobile` is `undefined`, condition is false
   - After `useEffect`: `isMobile` is `true/false`, condition might be true
   - DOM might re-render with different content

2. **Widget Visibility Flicker**:
   - On mobile, callback button might briefly show then disappear
   - Or vice versa - might be hidden then appear
   - User sees visual jump/flicker
   - Feels glitchy

3. **Server-Side Rendering Issues** (if app adds SSR):
   - Server doesn't have `window` object, can't detect mobile
   - Server renders for desktop
   - Client renders for mobile
   - HTML mismatch causes React warnings
   - App might fail to hydrate correctly

4. **React Console Warnings**:
   - If Strict Mode is enabled, might see hydration warnings
   - Doesn't break app, but indicates code issues
   - Professional code shouldn't have these warnings

#### **Why Not Fixed Yet**
- Low impact on Replit environment (no SSR currently)
- Doesn't cause functional bugs, only visual flicker
- Fix requires restructuring hook logic
- Better to fix when adding SSR support

#### **How to Fix** (Optional)

**Solution 1: Use State with useLayoutEffect**:
```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useLayoutEffect(() => {  // Changed from useEffect
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

Why this helps: `useLayoutEffect` runs synchronously before paint, reducing flicker.

**Solution 2: Provide Default Value**:
```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => 
    typeof window !== 'undefined' 
      ? window.innerWidth < MOBILE_BREAKPOINT 
      : false  // Default to false on server
  )
  // ... rest of hook
}
```

Why this helps: Hook initializes with actual value instead of undefined.

---

### **BUG #7: Nested AnimatePresence Causes Animation Conflicts**

**Severity**: 🟡 IMPORTANT  
**Category**: Animation Library - Framer Motion Quirk  
**Status**: ⚠️ Identified (Not Fixed - Requires Testing)

#### **Location**
- **Files**:
  - `client/src/components/sales/floating-cta.tsx` (lines 109-129)
  - `client/src/components/sales/chatbot.tsx` (lines 610-635)
- **Issue**: Nested `AnimatePresence` components

#### **Detailed Description**
The code has nested `AnimatePresence` components which can cause animation timing issues in Framer Motion.

```tsx
<AnimatePresence>                    {/* Outer */}
  {!shouldHideButton && (
    <motion.button>
      <AnimatePresence mode="wait">  {/* Inner */}
        {isOpen ? (
          <motion.div>...</motion.div>
        ) : (
          <motion.div>...</motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )}
</AnimatePresence>
```

The outer `AnimatePresence` manages the button visibility, while the inner one manages icon rotation. This nesting can cause unexpected animation behavior.

#### **Effects on Application**

1. **Animation Timing Issues**:
   - Icon rotation might not sync with button appearance
   - Animation could stutter or jump
   - Effects might not complete smoothly
   - Looks unprofessional

2. **Potential Exit Animation Loss**:
   - When button unmounts, inner AnimatePresence might not complete exit animation
   - Icon might snap to final state instead of animating out
   - Breaks smooth visual feedback

3. **Performance Considerations**:
   - Multiple AnimatePresence instances mean more reconciliation
   - On low-end devices, might cause jank
   - More memory usage than necessary

4. **Browser Compatibility Issues**:
   - Some browsers might handle nested animations differently
   - Could work fine in Chrome but break in Safari
   - Inconsistent behavior across devices

#### **Why Not Fixed Yet**
- Requires testing across devices/browsers to confirm actual impact
- Animation is cosmetic, not functional
- Only affects user perception, not data integrity
- Might not be noticeable on most devices

#### **How to Fix** (Optional)

**Solution: Simplify Animation Structure**:

Instead of:
```tsx
<AnimatePresence>
  {!shouldHideButton && (
    <motion.button>
      <AnimatePresence mode="wait">
        {/* Icon switching */}
      </AnimatePresence>
    </motion.button>
  )}
</AnimatePresence>
```

Do:
```tsx
<AnimatePresence>
  {!shouldHideButton && (
    <motion.button
      key={isOpen ? "close" : "open"}  // Key changes, triggers exit animation
      initial={{ rotate: isOpen ? 90 : -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      exit={{ rotate: isOpen ? -90 : 90, opacity: 0 }}
    >
      {isOpen ? <X /> : <Phone />}
    </motion.button>
  )}
</AnimatePresence>
```

**Benefits of this approach**:
- Single AnimatePresence handles all animations
- Icon change is driven by `key` change, cleaner logic
- Animations guaranteed to complete
- Simpler, more readable code
- Better performance (fewer re-renders)

---

## 📈 Bug Impact Summary

| Bug ID | Title | Severity | Functional Impact | User Impact | Status |
|--------|-------|----------|-------------------|-------------|--------|
| #1 | Callback form visible behind hidden button | 🔴 Critical | Widget visibility broken | Confusing UI | ✅ Fixed |
| #2 | startNewChat doesn't sync state | 🔴 Critical | Widget hiding fails | Widgets overlap | ✅ Fixed |
| #3 | No close button for callback form | 🔴 Critical | Users trapped in form | High frustration | ✅ Fixed |
| #4 | Context never resets to "none" | 🔴 Critical | State becomes stale | Incorrect behavior | ✅ Fixed |
| #5 | No Escape key handler | 🔴 Critical | Standard UX missing | Accessibility issue | ✅ Fixed |
| #6 | useIsMobile hydration mismatch | 🟡 Important | Visual flicker possible | Minor UX issue | ⚠️ Identified |
| #7 | Nested AnimatePresence conflicts | 🟡 Important | Animation timing issues | Possible animation stutter | ⚠️ Identified |

---

## ✅ Fix Verification Checklist

- [x] Callback form hidden when chat is open on mobile
- [x] Close button visible and functional on callback form
- [x] Escape key closes both chat and callback widgets
- [x] startNewChat properly syncs context state
- [x] Context state resets to "none" when widgets close
- [x] Form prevents duplicate submissions
- [x] No JavaScript errors in console
- [x] Mobile layout remains clean (no overlaps)
- [x] Desktop layout unaffected by changes
- [x] All data-testid attributes present for testing

---

## 🔄 Testing Recommendations

### Manual Testing
1. **Mobile (375px viewport)**:
   - Open chat → callback button hidden ✓
   - Close chat → callback button visible ✓
   - Open callback → chat button hidden ✓
   - Press Escape → widget closes ✓

2. **Desktop (1920px viewport)**:
   - Both buttons visible simultaneously ✓
   - Chat and callback can both be interacted with ✓
   - No visual overlap ✓
   - Animations smooth ✓

3. **Form Submissions**:
   - Rapid clicks send only 1 request ✓
   - Network tab shows single POST ✓
   - Database has 1 record, not duplicates ✓
   - Success message displays once ✓

### Automated Testing
```javascript
// Test 1: Mobile widget hiding
test('callback button hidden when chat opens on mobile', () => {
  const { getByTestId, queryByTestId } = render(<App />, {
    viewport: { width: 375, height: 667 }
  });
  fireEvent.click(getByTestId('chatbot-button'));
  expect(queryByTestId('floating-cta-button')).not.toBeInTheDocument();
});

// Test 2: Escape key closes widgets
test('escape key closes chat widget', () => {
  const { getByTestId } = render(<Chatbot />);
  const chatButton = getByTestId('chatbot-button');
  fireEvent.click(chatButton);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(getByTestId('chatbot-window')).not.toBeInTheDocument();
});

// Test 3: No duplicate submissions
test('rapid form submissions create only one request', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch');
  const { getByTestId } = render(<FloatingCTA />);
  
  const submit = getByTestId('floating-button-submit');
  fireEvent.click(submit);
  fireEvent.click(submit);
  fireEvent.click(submit);
  
  await waitFor(() => {
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📝 Conclusion

All **5 actual critical bugs** have been identified and fixed. The application now:
- ✅ Properly manages widget visibility on mobile
- ✅ Maintains synchronized state across components
- ✅ Provides standard UX patterns (close button, Escape key)
- ✅ Follows accessibility best practices

**Removed**: Bug #6 (Duplicate form submissions) was determined to be NOT a real bug after verification. The application is already well-protected through three layers:
1. UI-level button disabled state
2. HTML form submission event behavior
3. react-hook-form built-in protection

Two identified issues remain (hydration mismatch and animation nesting) that are low priority and can be addressed in future optimization phases.
