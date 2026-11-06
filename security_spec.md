# Security Specification: NOOR STUDIO E-Commerce

## 1. Data Invariants
1. **Public Catalog Readability**: Products, Categories, and StoreSettings are readable by any client (guest or authenticated) to enable browsing and store discovery.
2. **Catalog Write Protection**: Only verified administrators (`isAdmin()`) can create, update, or delete Products, Categories, and StoreSettings.
3. **Order Placement Invariant**: Anyone (guest or authenticated customer) can place an order provided the order payload conforms to required fields, realistic positive amounts, and initial status is 'Pending'.
4. **Order Read Protection**: Orders can only be read by the user who placed them (`resource.data.userId == request.auth.uid`), or by an authorized administrator (`isAdmin()`).
5. **Order Update Protection**: Customers cannot alter pricing, shipping, or items after creation. Only admins can update order status (e.g., Pending -> Confirmed -> Shipped -> Delivered).
6. **Cart & Wishlist Isolation**: Carts and Wishlists at `/carts/{userId}` and `/wishlists/{userId}` can ONLY be read or written by the matching authenticated owner (`request.auth.uid == userId`) or an admin.
7. **Reviews**: Authenticated users can submit product reviews with valid ratings between 1 and 5.
8. **Admin Privilege Guard**: Admin records at `/admins/{adminId}` can only be modified by existing verified admins. Bootstrapped admin email `sawairamaryam837@gmail.com` is granted administrative access.

## 2. Dirty Dozen Threat Payloads
1. **Unauthenticated Price Tampering**: An unauthenticated user attempts to update product price from 8990 to 1 -> DENIED.
2. **Customer Self-Discount Order**: Customer updates order total after placement -> DENIED.
3. **Cart Snooping**: User A attempts to read User B's cart at `/carts/userB` -> DENIED.
4. **Wishlist Hijacking**: User A attempts to overwrite User B's wishlist -> DENIED.
5. **Unauthorized Status Escalation**: Customer tries to set order status to 'Delivered' -> DENIED.
6. **Admin Creation Injection**: Non-admin attempts to create a document in `/admins/{uid}` -> DENIED.
7. **Ghost Field Injection**: Adding arbitrary admin flags to user order -> DENIED.
8. **Catalog Deletion Attack**: Non-admin attempts to delete `/categories/stitched` -> DENIED.
9. **Negative Price Order**: Creating an order with total = -5000 -> DENIED.
10. **Malicious ID Buffer Overflow**: Document creation with a 2MB ID string -> DENIED.
11. **Email Spoofing Attack**: User with fake token claiming admin email without `email_verified == true` -> DENIED.
12. **Settings Destruction**: Non-admin attempts to rewrite store helpline or WhatsApp -> DENIED.
