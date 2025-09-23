# CRUD Event System Usage Examples

## แนวทางใหม่: Generic CrudEventHelper Pattern

เพื่อแก้ปัญหา EventService ที่มีขนาดใหญ่เกินไปเมื่อมี CRUD entities เยอะ

## 1. Controller Usage Pattern

### Before (Old Way - ทำให้ EventService ใหญ่เกินไป)

```typescript
export class UsersController {
  constructor(
    private usersService: UsersService,
    private eventService: EventService,
  ) {}

  async createUser() {
    const user = await this.usersService.createUser(userData);
    this.eventService.users.userCreated(user); // ❌ Requires eventService.users object
  }
}

export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private eventService: EventService,
  ) {}

  async createProduct() {
    const product = await this.productsService.createProduct(productData);
    this.eventService.products.productCreated(product); // ❌ Requires eventService.products object
  }
}
```

### After (New Way - ใช้ Generic Pattern)

```typescript
import { CrudEventHelper } from '../../shared/websocket/crud-event-helper';

export class UsersController {
  private userEvents: CrudEventHelper;
  
  constructor(
    private usersService: UsersService,
    private eventService: EventService,
  ) {
    // ✅ Create CRUD event helper for users
    this.userEvents = this.eventService.createCrudHelper('users', 'user');
  }

  async createUser() {
    const user = await this.usersService.createUser(userData);
    this.userEvents.emitCreated(user); // ✅ Clean and generic
  }

  async updateUser() {
    const user = await this.usersService.updateUser(id, changes);
    this.userEvents.emitUpdated(user);
  }

  async deleteUser() {
    await this.usersService.deleteUser(id);
    this.userEvents.emitDeleted(id);
  }

  async activateUser() {
    const user = await this.usersService.activateUser(id);
    this.userEvents.emitActivated(user);
  }

  async bulkDeleteUsers() {
    const operationId = generateId();
    const userIds = request.body.userIds;
    
    // Emit bulk operation started
    this.userEvents.emitBulkStarted(operationId, 'delete', userIds.length);
    
    let completed = 0;
    let failed = 0;
    
    for (const userId of userIds) {
      try {
        await this.usersService.deleteUser(userId);
        completed++;
        
        // Emit progress
        this.userEvents.emitBulkProgress(operationId, completed, userIds.length, failed);
      } catch (error) {
        failed++;
        this.userEvents.emitBulkProgress(operationId, completed, userIds.length, failed);
      }
    }
    
    // Emit bulk operation completed
    this.userEvents.emitBulkCompleted(operationId, completed, failed);
  }
}
```

## 2. Products Controller Example

```typescript
export class ProductsController {
  private productEvents: CrudEventHelper;
  private inventoryEvents: CrudEventHelper;
  
  constructor(
    private productsService: ProductsService,
    private eventService: EventService,
  ) {
    // ✅ Multiple event helpers for different entities
    this.productEvents = this.eventService.createCrudHelper('products', 'product');
    this.inventoryEvents = this.eventService.createCrudHelper('products', 'inventory');
  }

  async createProduct() {
    const product = await this.productsService.createProduct(productData);
    this.productEvents.emitCreated(product);
  }

  async updateInventory() {
    const result = await this.productsService.updateInventory(productId, quantity);
    
    // Custom event for inventory changes
    this.inventoryEvents.emitCustom('updated', {
      productId,
      oldQuantity: result.oldQuantity,
      newQuantity: result.newQuantity,
      timestamp: new Date().toISOString()
    });

    // Stock alert if needed
    if (result.newQuantity <= result.threshold) {
      this.inventoryEvents.emitCustom('alert', {
        productId,
        currentStock: result.newQuantity,
        threshold: result.threshold,
        alertType: result.newQuantity === 0 ? 'out' : 'low'
      }, 'high');
    }
  }

  async updateProductPrice() {
    const oldProduct = await this.productsService.getProduct(productId);
    const updatedProduct = await this.productsService.updatePrice(productId, newPrice);
    
    // Use custom event for price changes
    this.productEvents.emitCustom('price_updated', {
      productId,
      oldPrice: oldProduct.price,
      newPrice: updatedProduct.price,
      effectiveDate: new Date().toISOString()
    });
  }
}
```

## 3. Orders Controller Example

```typescript
export class OrdersController {
  private orderEvents: CrudEventHelper;
  private paymentEvents: CrudEventHelper;
  private shipmentEvents: CrudEventHelper;
  
  constructor(
    private ordersService: OrdersService,
    private eventService: EventService,
  ) {
    this.orderEvents = this.eventService.createCrudHelper('orders', 'order');
    this.paymentEvents = this.eventService.createCrudHelper('orders', 'payment');
    this.shipmentEvents = this.eventService.createCrudHelper('orders', 'shipment');
  }

  async createOrder() {
    const order = await this.ordersService.createOrder(orderData);
    // Use high priority for important business events
    this.orderEvents.emitCreated(order, 'high');
  }

  async processPayment() {
    try {
      const payment = await this.paymentsService.processPayment(paymentData);
      this.paymentEvents.emitCreated(payment, 'high');
      
      // Update order status
      const order = await this.ordersService.updateOrderStatus(orderId, 'paid');
      this.orderEvents.emitStatusChanged({
        id: orderId,
        oldStatus: 'pending',
        newStatus: 'paid',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      // Emit payment failure with critical priority
      this.paymentEvents.emitCustom('failed', {
        orderId,
        paymentId: paymentData.id,
        error: error.message,
        timestamp: new Date().toISOString()
      }, 'critical');
    }
  }

  async cancelOrder() {
    const order = await this.ordersService.cancelOrder(orderId, reason);
    
    this.orderEvents.emitCustom('cancelled', {
      orderId,
      reason,
      cancelledBy: request.user.id,
      timestamp: new Date().toISOString()
    }, 'high');
  }

  async shipOrder() {
    const shipment = await this.shipmentsService.createShipment(shipmentData);
    this.shipmentEvents.emitCreated(shipment, 'high');
    
    // Update order status
    const order = await this.ordersService.updateOrderStatus(orderId, 'shipped');
    this.orderEvents.emitStatusChanged({
      id: orderId,
      oldStatus: 'paid',
      newStatus: 'shipped',
      trackingNumber: shipment.trackingNumber
    });
  }
}
```

## 4. Real-time Collaboration Example

```typescript
export class DocumentsController {
  private documentEvents: CrudEventHelper;
  
  constructor(
    private documentsService: DocumentsService,
    private eventService: EventService,
  ) {
    this.documentEvents = this.eventService.createCrudHelper('documents', 'document');
  }

  async lockDocument() {
    const lock = await this.documentsService.acquireLock(documentId, userId);
    
    if (lock.acquired) {
      this.documentEvents.emitLockAcquired(documentId, userId, 'edit');
    } else {
      // Conflict detected
      this.documentEvents.emitConflictDetected(
        documentId, 
        'lock_conflict', 
        [userId, lock.currentOwner]
      );
    }
  }

  async unlockDocument() {
    await this.documentsService.releaseLock(documentId, userId);
    this.documentEvents.emitLockReleased(documentId, userId, 'edit');
  }

  async updateDocument() {
    try {
      const result = await this.documentsService.updateDocument(documentId, changes);
      
      if (result.hasConflict) {
        this.documentEvents.emitConflictDetected(
          documentId,
          'version_conflict',
          result.conflictingUsers
        );
      } else {
        this.documentEvents.emitUpdated(result.document);
      }
      
    } catch (error) {
      if (error.code === 'VERSION_CONFLICT') {
        this.documentEvents.emitConflictDetected(
          documentId,
          'version_conflict',
          error.conflictingUsers
        );
      }
    }
  }
}
```

## 5. Benefits ของ Generic Pattern

### ✅ Scalability
- ไม่ต้องเพิ่ม methods ใน EventService สำหรับ entity ใหม่
- EventService ขนาดเล็กและ maintainable
- สร้าง event helper ได้ไม่จำกัด

### ✅ Consistency
- API เหมือนกันทุก entity
- Naming convention สม่ำเสมอ
- เรียนรู้ใช้งานง่าย

### ✅ Type Safety
- TypeScript types ครบถ้วน
- Auto-completion ใน IDE
- Compile-time error detection

### ✅ Flexibility
- Custom events ผ่าน `emitCustom()`
- Priority levels สำหรับทุก event
- Bulk operations support

### ✅ Performance
- ไม่มี overhead จาก unused methods
- Lazy loading เฉพาะที่ต้องการ
- Memory efficient

## 6. Migration Strategy

### Phase 1: เพิ่ม Generic Pattern (ปัจจุบัน)
```typescript
// เพิ่ม createCrudHelper() ใน EventService
// เก็บ legacy methods ไว้เพื่อ backward compatibility
```

### Phase 2: Update Existing Controllers
```typescript
// อัพเดตทีละ controller เป็น generic pattern
// ทดสอบทีละส่วน
```

### Phase 3: Remove Legacy Methods
```typescript
// เอา entity-specific methods ออกจาก EventService
// EventService จะเหลือแค่ core methods + createCrudHelper()
```

## 7. Frontend Integration

Frontend ยังคงใช้ pattern เดิมได้:

```typescript
// Angular Real-time Service
ngOnInit() {
  // Subscribe to any entity events
  this.websocketService.on('users.user.created', (data) => {
    this.handleUserCreated(data);
  });
  
  this.websocketService.on('products.product.deleted', (data) => {
    this.handleProductDeleted(data);
  });
  
  this.websocketService.on('orders.payment.failed', (data) => {
    this.showPaymentError(data);
  });
}
```

Frontend ไม่ต้องเปลี่ยนแปลงเพราะ event names ยังเหมือนเดิม!

## 8. Complete Example: CRM System

```typescript
// customers.controller.ts
export class CustomersController {
  private customerEvents: CrudEventHelper;
  private contactEvents: CrudEventHelper;
  
  constructor(
    private customersService: CustomersService,
    private eventService: EventService,
  ) {
    this.customerEvents = this.eventService.createCrudHelper('crm', 'customer');
    this.contactEvents = this.eventService.createCrudHelper('crm', 'contact');
  }

  async createCustomer() {
    const customer = await this.customersService.create(customerData);
    this.customerEvents.emitCreated(customer);
  }

  async addContact() {
    const contact = await this.customersService.addContact(customerId, contactData);
    this.contactEvents.emitCreated(contact);
  }

  async changeCustomerStatus() {
    const result = await this.customersService.changeStatus(customerId, newStatus);
    this.customerEvents.emitStatusChanged({
      id: customerId,
      oldStatus: result.oldStatus,
      newStatus: result.newStatus,
      changedBy: request.user.id,
      reason: request.body.reason
    });
  }
}

// leads.controller.ts
export class LeadsController {
  private leadEvents: CrudEventHelper;
  
  constructor(
    private leadsService: LeadsService,
    private eventService: EventService,
  ) {
    this.leadEvents = this.eventService.createCrudHelper('crm', 'lead');
  }

  async convertLead() {
    const result = await this.leadsService.convertToCustomer(leadId);
    
    // Lead converted
    this.leadEvents.emitCustom('converted', {
      leadId,
      customerId: result.customerId,
      convertedBy: request.user.id,
      timestamp: new Date().toISOString()
    }, 'high');
  }
}
```

แนวทางนี้ทำให้ระบบ scalable สำหรับ CRUD หลายๆ entity โดยไม่ทำให้ EventService ใหญ่เกินไป!