---
title: Payments API
description: PagBank/PagSeguro Payments API reference — Create Checkout endpoint, request/response schema, and recurring payments webhooks.
tags: [pagbank, pagseguro, payments, checkout, api, webhooks, recurring]
---

## Create Checkout

Create a customized checkout for each customer order. You can independently configure notifications for:

- **Payment status updates** via `payment_notification_urls`
- **Checkout status updates** via `notification_urls`

**Method:** `POST`  
**URL:** `https://sandbox.api.pagseguro.com/checkouts`

> 📘 See the Checkout service guide in PagBank docs for details about how checkout works and the available features.

---

### Headers

| Header          | Value              | Notes     |
| --------------- | ------------------ | --------- |
| `Authorization` | `Bearer <token>`   | Required. |
| `Content-Type`  | `application/json` | Required. |

---

### Request Body

#### Top-level fields

| Field                       | Type                 |    Required | Notes                                                                                                  |
| --------------------------- | -------------------- | ----------: | ------------------------------------------------------------------------------------------------------ |
| `reference_id`              | `string`             |          No | Unique order identifier in your system. Max 64 chars.                                                  |
| `expiration_date`           | `string (date-time)` |          No | ISO-8601. If omitted, defaults to **creation time + 2 hours**.                                         |
| `customer_modifiable`       | `boolean`            |          No | If `false`, `customer` becomes **required** (and all `customer` fields are required). Default: `true`. |
| `customer`                  | `object`             | Conditional | Required when `customer_modifiable` is `false`.                                                        |
| `items`                     | `array<object>`      |      ✅ Yes | Products associated with the order.                                                                    |
| `additional_amount`         | `integer`            |          No | Extra amount (in cents) added to the items total. Max 999999900.                                       |
| `discount_amount`           | `integer`            |          No | Discount (in cents). Must not exceed `items_total + additional_amount`. Max 999999900.                 |
| `shipping`                  | `object`             |          No | Delivery info. If omitted, no delivery is required.                                                    |
| `payment_methods`           | `array<object>`      |          No | Allowed payment methods for this checkout.                                                             |
| `payment_methods_configs`   | `array<object>`      |          No | Payment method settings (applies to CREDIT_CARD / DEBIT_CARD).                                         |
| `soft_descriptor`           | `string`             |          No | Text shown on card statement. Max 17 chars.                                                            |
| `redirect_url`              | `string`             |          No | Buyer redirect after payment completion. Max 255 chars.                                                |
| `return_url`                | `string`             |          No | Buyer return to your store (after completing/canceling in PagBank Checkout). Max 255 chars.            |
| `notification_urls`         | `array<string>`      |          No | Checkout status notifications (each 5–100 chars).                                                      |
| `payment_notification_urls` | `array<string>`      |          No | Payment status notifications (each 5–100 chars).                                                       |
| `recurrence_plan`           | `object`             |          No | Recurring billing plan configuration.                                                                  |

---

### `customer` object

> ⚠️ Required when `customer_modifiable` is `false` (and then all fields below are required).

| Field    | Type     | Notes                                                                                                         |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `name`   | `string` | Must include first and last name. Special chars allowed but may be removed; apostrophes and numbers are kept. |
| `email`  | `string` | Customer email.                                                                                               |
| `tax_id` | `string` | CPF (11) or CNPJ (14).                                                                                        |
| `phone`  | `object` | Phone details (see below).                                                                                    |

#### `phone` object (as returned in Checkout object)

| Field     | Type     | Notes                                       |
| --------- | -------- | ------------------------------------------- |
| `country` | `string` | Country code (DDI). Only `+55` is accepted. |
| `area`    | `string` | Area code (DDD), 2 chars.                   |
| `number`  | `string` | 9-digit phone number, must start with `9`.  |

---

### `items[]` object

| Field          | Type      | Required | Notes                                                         |
| -------------- | --------- | -------: | ------------------------------------------------------------- |
| `reference_id` | `string`  |       No | Product reference in seller system. Max 100 chars.            |
| `name`         | `string`  |       No | Product name. Max 100 chars.                                  |
| `description`  | `string`  |       No | Product description. Max 255 chars.                           |
| `quantity`     | `integer` |   ✅ Yes | Required.                                                     |
| `unit_amount`  | `integer` |   ✅ Yes | Unit price **in cents**. Max 999999900.                       |
| `image_url`    | `string`  |       No | `.png/.jpg/.jpeg`, max 15MB. Used on the checkout items list. |

---

### `shipping` object

If provided, you must define whether delivery is fixed, free, or calculated.

| Field                | Type      |    Required | Notes                                                                                   |
| -------------------- | --------- | ----------: | --------------------------------------------------------------------------------------- |
| `type`               | `enum`    |          No | `FIXED` \| `FREE` \| `CALCULATE` (default behavior depends on implementation).          |
| `service_type`       | `enum`    |          No | For calculated shipping: `SEDEX` \| `PAC`. If omitted, buyer can choose in checkout UI. |
| `address_modifiable` | `boolean` |          No | Default `true`. If `false`, `shipping.address` is required.                             |
| `amount`             | `integer` | Conditional | Required when `type` is `FIXED`. Amount **in cents**.                                   |
| `address`            | `object`  | Conditional | Required when `address_modifiable` is `false`.                                          |
| `box`                | `object`  | Conditional | Required when `type` is `CALCULATE`.                                                    |

---

### `payment_methods[]` object

| Field  | Type   | Notes                                              |
| ------ | ------ | -------------------------------------------------- |
| `type` | `enum` | `CREDIT_CARD` \| `DEBIT_CARD` \| `BOLETO` \| `PIX` |

> Some implementations also accept `brands` for card methods (when `type` is `CREDIT_CARD` or `DEBIT_CARD`) to restrict allowed card brands.

---

### `payment_methods_configs[]` object

Configurations apply only to `CREDIT_CARD` and `DEBIT_CARD`.

| Field            | Type            | Notes                          |
| ---------------- | --------------- | ------------------------------ |
| `type`           | `enum`          | `CREDIT_CARD` \| `DEBIT_CARD`  |
| `config_options` | `array<object>` | List of configuration options. |

#### `config_options[]` object

| Field    | Type     | Notes                                                                                                            |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `option` | `enum`   | `INSTALLMENTS_LIMIT` (max installments) \| `INTEREST_FREE_INSTALLMENTS` (installments with seller-paid interest) |
| `value`  | `string` | Option value.                                                                                                    |

---

### `recurrence_plan` object

| Field            | Type      | Required | Notes                                                                      |
| ---------------- | --------- | -------: | -------------------------------------------------------------------------- |
| `name`           | `string`  |   ✅ Yes | Plan name in your app. Max 100 chars.                                      |
| `billing_cycles` | `integer` |       No | Number of cycles (invoices) until expiration. Omit for no auto-expiration. |
| `interval`       | `object`  |       No | Time interval details (shape depends on PagBank plan rules).               |

---

### Example Request (minimal)

```json
{
  "reference_id": "ex-00001",
  "items": [
    {
      "reference_id": "ITEM01",
      "name": "Product Name",
      "description": "Product description",
      "quantity": 2,
      "unit_amount": 100
    }
  ],
  "redirect_url": "https://www.example.com/paid",
  "notification_urls": ["https://www.example.com/webhooks/checkout"]
}
```

### Example Request (with customer locked)

```json
{
  "reference_id": "ex-00001",
  "customer_modifiable": false,
  "customer": {
    "name": "Jose Abcd",
    "email": "email@test.com",
    "tax_id": "11111111111",
    "phone": {
      "country": "+55",
      "area": "11",
      "number": "911111111"
    }
  },
  "items": [
    {
      "reference_id": "ITEM01",
      "name": "Product Name",
      "description": "Product description",
      "quantity": 2,
      "unit_amount": 100,
      "image_url": "https://www.example.com/product.jpg"
    }
  ],
  "soft_descriptor": "Clothing",
  "redirect_url": "https://www.example.com/paid",
  "return_url": "https://www.example.com/return",
  "notification_urls": ["https://www.example.com/webhooks/checkout"],
  "payment_notification_urls": ["https://www.example.com/webhooks/payment"]
}
```

---

### Responses

#### `200 OK`

Returns a **Checkout** object.

#### `400 Bad Request`

Returned when validation fails or request is malformed.

---

## Checkout Object (Response)

| Field                       | Type                 | Notes                                                            |
| --------------------------- | -------------------- | ---------------------------------------------------------------- |
| `id`                        | `string`             | Checkout unique identifier (e.g., `CHEC_XXXX`).                  |
| `reference_id`              | `string`             | Your order identifier (max 64 chars).                            |
| `expiration_date`           | `string (date-time)` | ISO-8601.                                                        |
| `customer`                  | `object`             | Present when provided/required.                                  |
| `customer_modifiable`       | `boolean`            | Default `true`.                                                  |
| `items`                     | `array<object>`      | Items list.                                                      |
| `additional_amount`         | `integer`            | In cents.                                                        |
| `discount_amount`           | `integer`            | In cents.                                                        |
| `shipping`                  | `object`             | Shipping details.                                                |
| `payment_methods`           | `array<object>`      | Allowed payment methods.                                         |
| `payment_methods_configs`   | `array<object>`      | Payment config for card methods.                                 |
| `soft_descriptor`           | `string`             | Max 17 chars.                                                    |
| `redirect_url`              | `string`             | Max 255 chars.                                                   |
| `return_url`                | `string`             | Max 255 chars.                                                   |
| `notification_urls`         | `array<string>`      | Checkout notifications.                                          |
| `payment_notification_urls` | `array<string>`      | Payment notifications.                                           |
| `created_at`                | `string (date-time)` | ISO-8601.                                                        |
| `status`                    | `enum`               | `ACTIVE` \| `INACTIVE` \| `EXPIRED`. Default: `ACTIVE`.          |
| `links`                     | `array<object>`      | Operation links (e.g., `SELF`, `PAY`, `ACTIVATE`, `INACTIVATE`). |
| `recurrence_plan`           | `object`             | Recurrence plan details (if configured).                         |

---

## Webhooks (Recurring Payments)

Webhooks are notifications sent by PagBank to your server whenever an event occurs. To receive them, configure one or more URLs in your **notification preferences** in PagBank.

### Webhook Event Types

The PagBank Recurring Payments API generates webhooks for five event categories:

- Plans
- Coupons
- Customers (Subscribers)
- Subscriptions
- Payment refunds

---

### Plan events

| Event              | Description       |
| ------------------ | ----------------- |
| `plan.created`     | Plan created.     |
| `plan.updated`     | Plan updated.     |
| `plan.activated`   | Plan activated.   |
| `plan.inactivated` | Plan deactivated. |

### Coupon events

| Event                | Description         |
| -------------------- | ------------------- |
| `coupon.created`     | Coupon created.     |
| `coupon.activated`   | Coupon activated.   |
| `coupon.inactivated` | Coupon deactivated. |

### Customer (subscriber) events

| Event                           | Description                    |
| ------------------------------- | ------------------------------ |
| `customer.created`              | Customer created.              |
| `customer.updated`              | Customer updated.              |
| `customer.billing_info.updated` | Customer billing info updated. |

### Subscription events

| Event                     | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `subscription.initial`    | Subscription created.                                     |
| `subscription.updated`    | Subscription updated.                                     |
| `subscription.activated`  | Subscription activated.                                   |
| `subscription.suspended`  | Subscription suspended.                                   |
| `subscription.recurrence` | Subscription billing/invoice created (recurrence charge). |
| `subscription.expired`    | Subscription expired.                                     |
| `subscription.canceled`   | Subscription canceled.                                    |
| `subscription.migrated`   | Plan upgrade/downgrade (migration).                       |

### Refund events

| Event            | Description     |
| ---------------- | --------------- |
| `refund.created` | Refund created. |

---

### Example Webhook Payload (Subscription)

```json
{
  "env": "qa",
  "event": "subscription.initial | .updated | .suspended | .activated | .recurrence | .expired | .canceled | .migrated",
  "resource": {
    "amount": {
      "currency": "BRL",
      "value": 10000
    },
    "coupon": {
      "discount": {
        "type": "PERCENT",
        "value": 10000
      },
      "id": "COUP_FA8BE965-9264-443A-A148-38C70478A1C6"
    },
    "created_at": "2022-06-20T18:06:43.275-03:00",
    "customer": {
      "email": "bruno.ss@gmail.com",
      "id": "CUST_5226051F-77F5-4CF2-AAC0-F57F2A8582D2",
      "name": "Bruno Silva"
    },
    "exp_at": "2030-09-20",
    "id": "SUBS_5AAE1F81-29D3-41BC-F043-4BC69BA85D1C",
    "next_invoice_at": "2022-07-20",
    "payment_method": [
      {
        "card": {
          "brand": "visa",
          "exp_month": "11",
          "exp_year": "2034",
          "first_digits": "411111",
          "holder": {
            "name": "Bruno Silva"
          },
          "last_digits": "1111",
          "token": "TOKE_EC40****************************77D0"
        },
        "type": "CREDIT_CARD"
      }
    ],
    "plan": {
      "id": "PLAN_9DB0D197-137F-4BC4-BECB-C93EB226F34B",
      "name": "Plano Teste"
    },
    "pro_rata": false,
    "reference_id": "subscription-g",
    "status": "OVERDUE",
    "updated_at": "2022-06-20T18:06:44.809-03:00"
  },
  "links": [
    {
      "href": "https://sandbox.api.assinaturas.pagseguro.com/subscriptions",
      "media": "application/json",
      "rel": "SELF",
      "type": "GET"
    }
  ]
}
```

---

## Create Payment Refund

Create a **full refund** for a payment associated with a recurring billing charge.

**Method:** `POST`  
**URL:**

> 📘 For more details about recurring payments behavior, see the **Recurring Payments Service Guide** and the specific **Payments feature guide**.

---

### Important Notes

🚧 **Partial refunds are not supported**

Partial refunds are **not available** via this endpoint.

If a partial refund is required, you must use one of the following channels:

- Mobile (terminals or app)
- Internet Banking
- Customer support (call center)
- Email: `cancelarvendas@pagseguro.com`
- External API (cancellation API)

---

## Path Parameters

| Parameter    | Type     | Required | Description                                                                                          |
| ------------ | -------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `payment_id` | `string` | ✅ Yes   | Unique identifier of the payment to be refunded. Format: `PAYM_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX` |

---

## Headers

| Header              | Value            | Required | Notes                                                                                       |
| ------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------- |
| `Authorization`     | `Bearer <token>` | ✅ Yes   | Authentication token                                                                        |
| `x-idempotency-key` | `string`         | No       | Alphanumeric key (no special chars). Guarantees idempotency for **48 hours**. Max 200 chars |

---

## Request Body

### `amount` object

| Field      | Type      | Required | Description                                                                |
| ---------- | --------- | -------- | -------------------------------------------------------------------------- |
| `value`    | `integer` | ✅ Yes   | Refund amount **in cents** (max 9 digits). Example: R$ 1,500.99 → `150099` |
| `currency` | `string`  | ✅ Yes   | ISO 4217 currency code. Only `BRL` is supported                            |

> ℹ️ Even though the endpoint supports specifying an amount, **only full refunds are currently processed**.

---

## Example Request

```http
POST /payments/PAYM_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/refunds
Authorization: Bearer <token>
x-idempotency-key: refund-2024-08-01-001
Content-Type: application/json
{
  "amount": {
    "value": 150099,
    "currency": "BRL"
  }
}
```
