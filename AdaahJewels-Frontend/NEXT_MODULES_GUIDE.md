# Next Modules Implementation Guide

## Overview
All remaining modules should follow the exact same pattern as **Products.jsx**. This guide provides a template and checklist for implementing each module.

---

## Module Implementation Template

### Step 1: Create Service File
**File**: `src/admin/services/moduleName.js`

```javascript
import { executeProcedure } from '../api/dynamicApi';

export const getModuleItems = async (params = {}) => {
  const response = await executeProcedure('SP_ModuleList', params);
  return response;
};

export const getModuleItemById = async (id) => {
  const response = await executeProcedure('SP_ModuleGetById', { 
    p_Id: id 
  });
  return response;
};

export const createModuleItem = async (data) => {
  const response = await executeProcedure('SP_ModuleInsert', {
    p_Field1: data.field1,
    p_Field2: data.field2,
    // ... map all fields
  });
  return response;
};

export const updateModuleItem = async (id, data) => {
  const response = await executeProcedure('SP_ModuleUpdate', {
    p_Id: id,
    p_Field1: data.field1,
    p_Field2: data.field2,
    // ... map all fields
  });
  return response;
};

export const deleteModuleItem = async (id) => {
  const response = await executeProcedure('SP_ModuleDelete', {
    p_Id: id
  });
  return response;
};
```

### Step 2: Create Component File
**File**: `src/admin/pages/ModuleName.jsx`

Use this as a base template (copy from Products.jsx and modify):

```javascript
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import FormField from '../components/forms/FormField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  getModuleItems,
  createModuleItem,
  updateModuleItem,
  deleteModuleItem,
} from '../services/moduleName';
import toast from 'react-hot-toast';

export const ModuleName = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form data - MODIFY FIELDS AS NEEDED
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    // ... add all fields
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getModuleItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // MODIFY VALIDATION AS NEEDED
  const validateForm = () => {
    const errors = {};
    if (!formData.field1?.trim()) errors.field1 = 'Field 1 is required';
    if (!formData.field2?.trim()) errors.field2 = 'Field 2 is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      field1: '',
      field2: '',
      // ... reset all fields
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      field1: item.field1 || '',
      field2: item.field2 || '',
      // ... map all fields
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await updateModuleItem(selectedItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        await createModuleItem(formData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (item) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      await deleteModuleItem(deleteTarget.id);
      toast.success('Item deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // MODIFY FILTER AS NEEDED
  const filteredItems = items.filter((item) =>
    item.field1?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // MODIFY COLUMNS AS NEEDED
  const columns = [
    { key: 'field1', label: 'Field 1' },
    { key: 'field2', label: 'Field 2' },
  ];

  if (loading) {
    return <AdminLayout><LoadingSpinner fullScreen /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Module Name</h1>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredItems}
          loading={loading}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title={selectedItem ? 'Edit Item' : 'Add New Item'}
        size="2xl"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MODIFY FORM FIELDS AS NEEDED */}
          <FormField
            label="Field 1"
            name="field1"
            value={formData.field1}
            onChange={handleFormChange}
            error={formErrors.field1}
            placeholder="Enter field 1"
            required
          />

          <FormField
            label="Field 2"
            name="field2"
            value={formData.field2}
            onChange={handleFormChange}
            error={formErrors.field2}
            placeholder="Enter field 2"
            required
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete this item? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </AdminLayout>
  );
};

export default ModuleName;
```

### Step 3: Update AdminRouter
**File**: `src/admin/AdminRouter.jsx`

```javascript
// Add import at top
import ModuleName from './pages/ModuleName';

// Replace placeholder route
<Route
  path="/module-name"
  element={
    <AdminProtectedRoute>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <ModuleName />
      </Suspense>
    </AdminProtectedRoute>
  }
/>
```

### Step 4: Update Sidebar Navigation
**File**: `src/admin/layouts/AdminSidebar.jsx`

Add menu item in the navigation list:
```javascript
{
  icon: IconName,  // Import from lucide-react
  label: 'Module Name',
  href: '/admin/module-name'
}
```

---

## Module-Specific Checklist

### Categories Module
- [ ] Service: categoryService.js (SP_CategoryList, SP_CategoryInsert, etc.)
- [ ] Component: Categories.jsx
- [ ] Fields: name, slug, image, status, parent_category
- [ ] Special: Image upload, category tree/hierarchy
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test CRUD operations

### Orders Module
- [ ] Service: orderService.js (SP_OrderList, SP_OrderDetails, SP_OrderStatusUpdate)
- [ ] Component: Orders.jsx
- [ ] Fields: order_id, customer_name, total, status, order_date
- [ ] Special: Status dropdown (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- [ ] Special: View invoice/order details
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test status updates

### Customers Module
- [ ] Service: customerService.js (SP_CustomerList, SP_CustomerDetails, SP_CustomerOrders)
- [ ] Component: Customers.jsx
- [ ] Fields: name, email, phone, total_orders, total_spent
- [ ] Special: View purchase history tab
- [ ] Special: Customer analysis/metrics
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test customer details view

### Coupons Module
- [ ] Service: couponService.js
- [ ] Component: Coupons.jsx
- [ ] Fields: code, discount_type (fixed/percentage), discount_value, min_order, start_date, end_date, status
- [ ] Special: Date picker for start/end dates
- [ ] Special: Discount type toggle
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test coupon creation

### Banners Module
- [ ] Service: bannerService.js
- [ ] Component: Banners.jsx
- [ ] Fields: title, desktop_image, mobile_image, url, sort_order, status
- [ ] Special: Image uploads for desktop/mobile
- [ ] Special: Preview image before saving
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test banner preview

### Testimonials Module
- [ ] Service: testimonialService.js
- [ ] Component: Testimonials.jsx
- [ ] Fields: customer_name, text, rating (1-5 stars), status
- [ ] Special: Star rating display/input
- [ ] Special: Truncate long testimonials in list
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test rating display

### Inventory Module
- [ ] Service: inventoryService.js (SP_InventoryList, SP_InventoryUpdate, SP_LowStockProducts)
- [ ] Component: Inventory.jsx
- [ ] Fields: product_name, current_stock, min_stock_level, reorder_quantity
- [ ] Special: Low stock alerts (highlight red)
- [ ] Special: Bulk stock update
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test low stock alerts

### Reports Module
- [ ] Service: reportService.js
- [ ] Component: Reports.jsx
- [ ] Special: Multiple report types (Sales, Revenue, Product, Customer, Inventory)
- [ ] Special: Date range picker
- [ ] Special: Charts using Recharts
- [ ] Special: Export to CSV/Excel/PDF
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test chart rendering

### Settings Module
- [ ] Service: settingsService.js (SP_WebsiteSettingsGet, SP_WebsiteSettingsUpdate)
- [ ] Component: Settings.jsx
- [ ] Fields: website_name, logo, favicon, email, phone, address, social_links, meta_description, footer_text
- [ ] Special: Logo/favicon upload
- [ ] Special: Social media links editor
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test settings persistence

### Admin Users Module
- [ ] Service: adminUserService.js
- [ ] Component: AdminUsers.jsx
- [ ] Fields: name, email, role, permissions, status
- [ ] Special: Role selector (Super Admin, Admin, Manager, Inventory Manager, Order Manager)
- [ ] Special: Permissions multi-select
- [ ] Special: Password change functionality
- [ ] Add to AdminRouter
- [ ] Update Sidebar
- [ ] Test role-based permissions

---

## Common Issues & Solutions

### Issue: Data not loading
**Check**:
1. Service file imports and methods correct
2. Stored procedure name matches backend (SP_ModuleList, etc.)
3. Parameters in executeProcedure match procedure parameters
4. Console shows no errors

**Fix**:
```javascript
// Add console logs in service
console.log('Calling SP_ModuleList with params:', params);
const response = await executeProcedure('SP_ModuleList', params);
console.log('Response:', response);
```

### Issue: Form not saving
**Check**:
1. validateForm() returns true
2. executeProcedure is called with correct parameters
3. Parameters match procedure parameter names (p_FieldName)
4. API response is handled correctly

**Fix**:
```javascript
// Map form data correctly
await updateModuleItem(id, {
  p_Field1: formData.field1,  // Must match procedure param name
  p_Field2: formData.field2,
});
```

### Issue: Modal not closing
**Check**:
1. setShowModal(false) is called after success
2. isSubmitting is set to false in finally block
3. No errors in console

### Issue: Search not working
**Check**:
1. filteredItems filter logic is correct
2. searchTerm state is updating
3. DataTable onSearchChange is connected

---

## Testing Each Module

### Before starting next module:
1. Run `npm run build` to check for errors
2. Run `npm run lint` to check code quality
3. Start dev server: `npm run dev`
4. Test login flow: `/admin/login`
5. Navigate to module: `/admin/module-name`

### Testing checklist for each module:
- [ ] Page loads without errors
- [ ] List displays data from backend
- [ ] Search/filter works
- [ ] Add button opens modal
- [ ] Add form validates correctly
- [ ] Add button saves data
- [ ] Toast notification appears
- [ ] New data appears in table
- [ ] Edit button opens modal with data
- [ ] Edit form saves changes
- [ ] Delete button shows confirmation
- [ ] Delete removes item from table
- [ ] Error handling works (try with invalid data)
- [ ] Loading states display correctly
- [ ] Page is responsive on mobile

---

## Performance Tips

1. **Add debounced search** to reduce API calls:
```javascript
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    // Filter or API call here
  }, 500);
  
  return () => clearTimeout(timer);
}, [searchTerm]);
```

2. **Implement pagination** for large datasets:
```javascript
const [page, setPage] = useState(1);
const itemsPerPage = 10;

const loadData = async () => {
  const data = await getModuleItems({ 
    page, 
    limit: itemsPerPage 
  });
};
```

3. **Memoize callbacks** to prevent unnecessary re-renders:
```javascript
import { useCallback } from 'react';

const handleEditItem = useCallback((item) => {
  // Logic here
}, []);
```

---

## Recommended Implementation Order

1. **Categories** - Simplest CRUD, required for Products dropdown
2. **Customers** - Simple CRUD with view details
3. **Orders** - Slightly complex with status management
4. **Inventory** - Stock management with alerts
5. **Coupons** - Date and discount type handling
6. **Banners** - Image upload handling
7. **Testimonials** - Rating display
8. **Reports** - Charts and exports (most complex)
9. **Settings** - Configuration management
10. **Admin Users** - RBAC implementation

---

## Quick Copy-Paste Items

### Service file imports:
```javascript
import { executeProcedure } from '../api/dynamicApi';
```

### Component imports:
```javascript
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import ConfirmDialog from '../components/modals/ConfirmDialog';
import FormField from '../components/forms/FormField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import toast from 'react-hot-toast';
```

### Router imports:
```javascript
import ModuleName from './pages/ModuleName';
import { Suspense } from 'react';
```

---

**Last Updated**: June 3, 2026
**Status**: Ready for module implementation
