# Security Specification: NOOR STUDIO E-Commerce

## 1. Data Invariants
1. **Public Catalog Readability**: Products, Categories, and StoreSettings are readable by any client (guest or authenticated) to enable browsing and store discovery.
2. **Catalog Write Protection**: Only verified administrators (`isAdmin()`) can create, update, or delete Products, Categories, and StoreSettings.
3. **User Profile Privacy & Role Immutability**: Documents at `/users/{userId}` can ONLY be read or updated by the owning user (`request.auth.uid == userId`) or a verified administrator (`isAdmin()`). Self-registration strictly enforces `role == 'customer'` and `uid == request.auth.uid`. Customers can NEVER change `role`, `uid`, `email`, or `createdAt`.
4. **Order Placement Invariant**: Authenticated customers can place orders where `userId == request.auth.uid` (and `customerId == request.auth.uid`) with initial `orderStatus == 'Pending'`. Guest checkout sets `isGuest == true` with no forged `userId`/`customerId`.
5. **Order Read Protection**: Orders at `/orders/{orderId}` can ONLY be read (`get` or `list`) by the owning customer (`resource.data.userId == request.auth.uid` or `resource.data.customerId == request.auth.uid`) or by a verified administrator (`isAdmin()`). Unauthenticated users and other customers can NEVER read or list another customer's order PII.
6. **Order Update Protection**: Customers cannot alter pricing, items, tracking, or order statuses after creation. Only verified administrators can update or delete orders.
7. **Cart & Wishlist Isolation**: Carts and Wishlists at `/carts/{userId}` and `/wishlists/{userId}` can ONLY be read or written by the matching authenticated owner (`request.auth.uid == userId`) or a verified administrator.
8. **Reviews**: Authenticated users can submit product reviews with valid ratings between 1 and 5.
9. **Admin Privilege Guard**: Admin records at `/admins/{adminId}` can only be listed or modified by verified administrators. Administrative access is strictly restricted to the authorized administrator email `noorstudio16mpa@gmail.com` with `email_verified == true` (verified both in Firestore Rules and cryptographically on the Express backend via Firebase ID tokens / Custom Claims).
10. **Zero Frontend Admin Exposure**: No admin login links, dashboard navigation buttons, demo admin accounts, or admin email hints are displayed anywhere on the customer-facing storefront.

## 2. Dirty Dozen Threat Payloads
1. **Unauthenticated Price Tampering**: Unauthenticated or customer user attempts to update product price -> DENIED.
2. **Customer Cross-Profile Snooping**: Customer A attempts to `get` or `list` `/users/customerB` -> DENIED.
3. **Self-Assigned Admin Role Escalation**: Customer registers at `/users/{uid}` with `role: 'admin'` or updates `role` to `'admin'` -> DENIED.
4. **Customer Cross-Order Snooping**: Customer A attempts to `get` or `list` Customer B's order at `/orders/{orderId}` -> DENIED.
5. **Unauthorized Order Status Escalation**: Customer tries to update `orderStatus` to `'Delivered'` or forge `trackingNumber` -> DENIED.
6. **Order Identity Spoofing**: Customer A creates an order with `userId: 'customerB'` -> DENIED.
7. **Admin Registry Injection**: Non-admin attempts to write to `/admins/{uid}` -> DENIED.
8. **Email Spoofing Attack**: User with unverified token (`email_verified == false`) claiming admin email -> DENIED.
9. **Shadow / Ghost Field Injection**: Client sends unexpected fields (`isAdmin: true`, `customDiscount: 99999`) to `/users/{uid}` -> DENIED by `keys().hasOnly()`.
10. **Negative Price Order / Catalog Manipulation**: Creating an order with `total = -5000` or deleting `/categories/stitched` as a customer -> DENIED.
11. **Malicious ID Buffer Overflow**: Document creation with oversized >128 byte ID or invalid characters -> DENIED by `isValidId()`.
12. **Backend API Privilege Escalation**: Customer sends Bearer ID token to `GET /api/orders`, `PATCH /api/orders/:id`, `GET /api/emails`, or `POST /api/auth/verify-admin` -> DENIED with HTTP 403 Forbidden.
