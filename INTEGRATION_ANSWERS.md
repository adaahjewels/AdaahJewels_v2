# Easy Answers for Adaah Jewels Integration

This document captures the straightforward implementation decisions for the storefront so work can proceed quickly.

## Core decisions

| Topic | Answer |
|---|---|
| Keep existing API routes? | Yes. Keep the current frontend and backend route contracts unchanged while replacing the data layer underneath. |
| Use MySQL stored procedures or direct SQL? | Use stored procedures for the main business flows |
| Use a separate product catalog? | Yes. Keep this jewellery storefront as a separate catalog from the earlier app. |
| Share user accounts with the old app? | No. Keep user accounts isolated for this storefront unless a shared auth system is required later. |
| Handle product and banner images? | Store image URLs in the database and use the existing upload/storage workflow. |
| What if the backend is unavailable during checkout? | Show a friendly error, keep the cart intact, and do not create an order until the backend confirms success. |
| Use Razorpay in production? | Yes. Keep Razorpay as the primary payment provider for the storefront. |
| Send email and SMS automatically? | Yes, send them automatically for order confirmation and important status changes. |
| Show invoice actions in the UI? | Yes. Add clear invoice download and email actions on order pages. |
| Keep MySQL local and production ready? | Yes. Use environment-based connection settings for both local development and production. |

## Recommended approach

- Preserve the current frontend experience.
- Swap the backend persistence layer to MySQL without changing the public API shape.
- Keep notifications and payments enabled once the environment variables are configured.
- Use the existing premium UI flow and only wire it to real backend services.
