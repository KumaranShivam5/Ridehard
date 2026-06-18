# RideHard Command Center — Security Specifications & Invariants

This specification defines the Attribute-Based Access Control (ABAC) and Relational Gates designed to enforce the integrity of RideHard's Northeast India motorcycle expedition database.

## 1. Data Invariants

1. **Identity Integrity**: No user may register a booking under another user's identity. If authenticated, the `customerEmail` or logged-in state should align. For guest bookings, they are allowed to create a booking under `Pending Verification`.
2. **State Transition Locking**: Bookings cannot be directly confirmed by clients. State changes to `Confirmed` must be rejected for standard users; only administrators (validated via the `/admins/{uid}` path) can modify are or toggle verification statuses.
3. **Temporal Integrity**: All bookings must possess valid timestamps matching `request.time`. Created-at dates must be immutable after the initial write.
4. **Auto-Inventory Integrity**: When a booking is finalized, the corresponding vehicle's `blockedDates` must be synchronously expanded to lock out double bookings.
5. **CMS Report Protection**: Field report CMS blogs can only be authored and managed by verified corporate administrators. Read access to route warnings is completely open to ensure consumer safety.

## 2. The Dirty Dozen (Malicious Action Payloads)

1. **Payload 1: Identity Impersonation (Spoofing ID)**
   * *Target*: `/bookings/b_evil_1`
   * *Payload*: `{ "id": "b_evil_1", "customerEmail": "victim@gmail.com", "status": "Confirmed" }`
   * *Vulnerability Checked*: Forbid non-admins from creating pre-confirmed bookings or booking with other emails.
2. **Payload 2: Route Report Hijack (CMS Poisoning)**
   * *Target*: `/field_reports/r_evil_2`
   * *Payload*: `{ "title": "False Clear Route", "territory": "Sela Pass", "warning": "Safe", "bodyText": "Path is fully dry (lies)", "createdAt": "2026-05-31T00:00:00Z" }`
   * *Vulnerability Checked*: Prevent anonymous writing to `field_reports`.
3. **Payload 3: Fleet Metric Sabotage (Price Tampering)**
   * *Target*: `/vehicles/himalayan_450`
   * *Payload*: `{ "dailyRate": 1, "name": "Sabotaged Bike" }`
   * *Vulnerability Checked*: Prevent standard clients from modifying vehicle descriptions or rates.
4. **Payload 4: Phantom Booking Creation**
   * *Target*: `/bookings/b_evil_4`
   * *Payload*: Including field `shadow_promoCode: "FREE_100"` that doesn't belong to the schema.
   * *Vulnerability Checked*: Enforce strict key checks on create to reject shadow properties.
5. **Payload 5: Mass Update Overwrite (Status Jacking)**
   * *Target*: `/bookings/real_booking_1`
   * *Payload*: `{ "status": "Confirmed" }` submitted by non-admin.
   * *Vulnerability Checked*: Verify only admin signatures can transition verified records.
6. **Payload 6: Denial of Wallet via Giant Document Strings**
   * *Target*: `/bookings/b_evil_6`
   * *Payload*: `{ "customerName": "[1MB of garbage character data...]" }`
   * *Vulnerability Checked*: Apply strict `.size() <= 100` type bounds on character lengths.
7. **Payload 7: Invalid ID Injection (ID Path Poisoning)**
   * *Target*: `/bookings/INVALID%20BOOKING%20$!@`
   * *Payload*: `{ ... }`
   * *Vulnerability Checked*: Path rules must strictly match `isValidId(bookingId)` pattern `^[a-zA-Z0-9_\-]+$`.
8. **Payload 8: Retroactive Clock Backdating**
   * *Target*: `/bookings/b_evil_8`
   * *Payload*: `{ "createdAt": "2010-01-01T00:00:00Z" }`
   * *Vulnerability Checked*: Enforce `createdAt == request.time`.
9. **Payload 9: Guest Deletion of Manifest Ledger**
   * *Target*: `/bookings/real_booking_1`
   * *Action*: `delete` request by guest.
   * *Vulnerability Checked*: Standard users cannot delete bookings.
10. **Payload 10: Anonymous Admin Spoofing**
    * *Target*: `/admins/attacker_uid`
    * *Payload*: `{ "email": "attacker@gmail.com", "role": "admin" }`
    * *Vulnerability Checked*: Global rules must lock down access to `/admins/` path.
11. **Payload 11: Non-Standard List Scraping**
    * *Target*: `/bookings` (using open get query without email validation)
    * *Vulnerability Checked*: Ensure list requests check email ownership or admin auth.
12. **Payload 12: Invalid Date Range Insertion**
    * *Target*: `/bookings/b_evil_12`
    * *Payload*: `{ "startDate": "stale_date", "endDate": "2026-05-31" }`
    * *Vulnerability Checked*: Confirm structural format alignment with `YYYY-MM-DD`.
