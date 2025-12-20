# Budget Request API Contract

## API Overview

**Base URL**: `/api/budget-requests`
**Authentication**: Required
**Content Type**: `application/json`

## Endpoints

### 1. List Budget Requests

**GET** `/api/budget-requests`

Retrieves a paginated list of budget requests.

**Authentication:** Required

#### Query Parameters

- `page` (number, required): Page number starting from 1
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (pending, approved, rejected)
- `sort` (string, optional): Sort field and direction (default: -createdAt)

#### Response Schema

```typescript
interface ListBudgetRequestsResponse {
  data: BudgetRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

#### Response Example

```json
{
  "data": [
    {
      "id": "req-001",
      "title": "Q1 Marketing Budget",
      "amount": 50000,
      "status": "approved",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid query parameters

**401 Unauthorized** - Authentication required

### 2. Create Budget Request

**POST** `/api/budget-requests`

Creates a new budget request.

**Authentication:** Required

#### Request Schema

```typescript
interface CreateBudgetRequestPayload {
  title: string;
  description: string;
  amount: number;
  departmentId: string;
  fiscalYear: number;
}
```

#### Response Schema

```typescript
interface BudgetRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  departmentId: string;
  fiscalYear: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

#### Response Example

```json
{
  "id": "req-002",
  "title": "Q2 Operations Budget",
  "description": "Operational expenses for Q2",
  "amount": 75000,
  "departmentId": "dept-001",
  "fiscalYear": 2024,
  "status": "pending",
  "createdAt": "2024-01-20T10:15:00Z",
  "updatedAt": "2024-01-20T10:15:00Z"
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid fields

**401 Unauthorized** - Authentication required

**409 Conflict** - Duplicate budget request

### 3. Get Budget Request Details

**GET** `/api/budget-requests/:id`

Retrieves details of a specific budget request.

**Authentication:** Required

#### Path Parameters

- `id` (string, required): Budget request ID

#### Response Schema

```typescript
interface BudgetRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  departmentId: string;
  fiscalYear: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

#### Error Responses

**401 Unauthorized** - Authentication required

**404 Not Found** - Budget request not found

### 4. Update Budget Request

**PATCH** `/api/budget-requests/:id`

Updates a budget request (only allowed when status is pending).

**Authentication:** Required

#### Path Parameters

- `id` (string, required): Budget request ID

#### Request Schema

```typescript
interface UpdateBudgetRequestPayload {
  title?: string;
  description?: string;
  amount?: number;
}
```

#### Response Schema

```typescript
interface BudgetRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  departmentId: string;
  fiscalYear: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

#### Error Responses

**400 Bad Request** - Invalid input

**401 Unauthorized** - Authentication required

**404 Not Found** - Budget request not found

**409 Conflict** - Cannot update approved or rejected requests

### 5. Delete Budget Request

**DELETE** `/api/budget-requests/:id`

Deletes a budget request (only allowed when status is pending).

**Authentication:** Required

#### Path Parameters

- `id` (string, required): Budget request ID

#### Response Schema

```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

#### Error Responses

**401 Unauthorized** - Authentication required

**404 Not Found** - Budget request not found

**409 Conflict** - Cannot delete approved or rejected requests
