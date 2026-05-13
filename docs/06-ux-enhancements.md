# DineFlow UX Enhancements & Component Addendum

This document supplements `05-master-prompt.md` and `03-ui-ux-wireframes.md`. It defines critical interactive elements and feedback mechanisms required for a production-grade user experience.

## 1. Menu Item "Order" Button

**Requirement:** Every menu item card (Food and Drink) must include a prominent **"Order"** button.

- **Location:** Aligned to the right side of the item card, vertically centered with the price.
- **Style:** `bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-500 transition-all`
- **Behavior (Guest & Registered):**
  - Clicking **"Order"** adds exactly **one (1)** quantity of the item to the cart.
  - **Visual Feedback:** The button text briefly changes to "Added!" and the cart icon in the header should animate/badge update.
  - **No Modal:** Do not open a modal for a simple "Order" click. Keep the interaction frictionless.

## 2. Confirmation Modals

**Requirement:** Modals are required for destructive actions or critical confirmations.

**Modal Component:** Use `shadcn/ui` AlertDialog component.

| Scenario                   | Trigger                                        | Modal Title          | Description                                                       | Actions                |
| :------------------------- | :--------------------------------------------- | :------------------- | :---------------------------------------------------------------- | :--------------------- |
| **Remove Item from Cart**  | Clicking trash icon in Cart Drawer             | "Remove Item?"       | "Are you sure you want to remove [Item Name] from your order?"    | Cancel / Remove        |
| **Place Order (Guest)**    | Clicking "Place Order" in Cart                 | "Confirm Your Order" | "You are ordering as a Guest. Order history will not be saved."   | Cancel / Confirm Order |
| **Allergy Warning**        | Adding item containing user's allergen to cart | "Allergy Warning"    | "This item contains [Allergen]. Are you sure you want to add it?" | Cancel / Add Anyway    |
| **Cancel Order (Kitchen)** | Clicking "Void/Cancel" on KDS ticket           | "Void Order?"        | "Provide reason for voiding Table [X] order."                     | Cancel / Void Order    |

## 3. Snackbars / Toast Notifications

**Requirement:** Use `shadcn/ui` Sonner (Toast) component for all non-blocking feedback.

**Global Position:** Bottom-Right corner of the viewport.

| Event                  | Toast Message                             | Type    | Duration |
| :--------------------- | :---------------------------------------- | :------ | :------- |
| Item Added to Cart     | "[Item Name] added to cart"               | Success | 3s       |
| Item Removed from Cart | "[Item Name] removed"                     | Info    | 3s       |
| Order Placed           | "Order sent to kitchen!"                  | Success | 5s       |
| Order Status Update    | "Kitchen started preparing your order"    | Info    | 4s       |
| Error Occurred         | "Something went wrong. Please try again." | Error   | 5s       |
| Waiter Called          | "Your server has been notified"           | Success | 3s       |

## 4. Required Additional Pages & Views

The following pages are **mandatory** for a complete restaurant application and must be generated, even if they were not explicitly detailed in the initial wireframes.

- **Checkout Page:** `/checkout`
  - **Path:** `apps/web/src/app/(customer)/checkout/page.tsx`
  - **Content:** Order summary, tip selection (%, custom), special instructions input, and "Pay Now" button.
  - **Note:** Integrate with Stripe Elements or a dummy payment flow for demo purposes.

- **Order Tracking Page:** `/track/[orderId]`
  - **Path:** `apps/web/src/app/(customer)/track/[orderId]/page.tsx`
  - **Content:** Real-time status stepper (Received -> Cooking -> Ready -> Served). Includes estimated wait time display using WebSocket subscription.

- **Profile Settings Page:** `/profile`
  - **Path:** `apps/web/src/app/(customer)/profile/page.tsx`
  - **Content:** Avatar upload, Name, Email, Dietary Preferences (Multi-select chips), Allergy Settings.

- **Staff Login Page:** `/staff/login`
  - **Path:** `apps/web/src/app/(auth)/staff/login/page.tsx`
  - **Content:** Email/Password form distinct from customer login. Redirects to role-specific dashboard (Waiter/Kitchen/Manager).

- **404 Not Found Page:** `not-found.tsx`
  - **Content:** Friendly illustration, "Page not found" text, and a button to return to the home menu.

## 5. Component Architecture for AI Generation

When generating the frontend, the AI **MUST** adhere to the following structure:

```tsx
// Example MenuItemCard.tsx
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

export const MenuItemCard = ({ item }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleOrder = () => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="...">
      {/* Image & Details */}
      <button onClick={handleOrder} className="bg-primary text-white px-4 py-2 rounded-md">
        Order
      </button>
    </div>
  );
};
```
