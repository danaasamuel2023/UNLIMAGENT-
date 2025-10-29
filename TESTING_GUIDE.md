# Complete Testing Guide for New Features

## 🚀 Quick Start

### 1. Apply Database Migration
See `APPLY_MIGRATION.md` for detailed instructions on how to apply the migration via Supabase Dashboard.

### 2. Start Development Server
```bash
npm run dev
```
Server should be running at: http://localhost:3000

---

## 📋 Testing Checklist

### ✅ Test 1: API Documentation Page

**URL:** http://localhost:3000/api-docs

**What to Check:**
- [ ] Page loads without errors
- [ ] Navigation sidebar works (scrolls to sections)
- [ ] All code examples are properly formatted
- [ ] Links are working
- [ ] Responsive design works on mobile
- [ ] Copy code button works (if implemented)
- [ ] All sections are visible:
  - [ ] Overview
  - [ ] Authentication
  - [ ] Endpoints
  - [ ] Code Examples
  - [ ] Support

**Expected Result:** A professional API documentation page with all sections displaying correctly.

---

### ✅ Test 2: Premium Badges

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `TEST_PREMIUM_BADGES.sql` (update IDs with your actual store/product IDs)
3. Visit a store page: http://localhost:3000/store/YOUR_STORE_SLUG

**What to Check:**
- [ ] Premium badge appears on premium tier products
- [ ] Badge shows correct features (Priority, Enhanced Reliability, Faster Delivery)
- [ ] Badge has correct purple gradient styling
- [ ] Badge shows custom benefits if provided
- [ ] Standard products don't show premium badge (unless they have enhanced features)
- [ ] Badge is responsive on mobile

**Expected Result:** Products with premium tier or enhanced features show a beautiful purple badge with checkmarks for each feature.

---

### ✅ Test 3: Network-Specific Badges

**Steps:**
1. Update a product to have `bundle_type`:
   - Set `bundle_type = 'UP2U'` for MTN products
   - Set `bundle_type = 'iShare'` for AirtelTigo products
2. Visit the store page

**What to Check:**
- [ ] "UP2U" badge appears on MTN products (blue badge)
- [ ] "iShare" badge appears on AirtelTigo products (purple badge)
- [ ] Badge is positioned at top-right of network logo
- [ ] Badge has proper styling and contrast
- [ ] Logo is still readable with badge

**Expected Result:** Network logos show small badges indicating the bundle type (UP2U, iShare, Premium).

---

### ✅ Test 4: Store Sharing Feature

**URL:** http://localhost:3000/store/YOUR_STORE_SLUG

**What to Check:**
- [ ] Share section appears in sidebar
- [ ] WhatsApp button works (opens WhatsApp with pre-filled message)
- [ ] Facebook button works (opens Facebook share)
- [ ] Twitter button works (opens Twitter share)
- [ ] Copy Link button works (copies URL to clipboard)
- [ ] Success feedback shows when link is copied
- [ ] All buttons are visually appealing with emojis
- [ ] Buttons are responsive
- [ ] Share URL is correct format

**Test Sharing:**
```bash
# Test WhatsApp
Click WhatsApp → Should open WhatsApp app/web with message

# Test Facebook
Click Facebook → Should open Facebook share dialog

# Test Twitter
Click Twitter → Should open Twitter compose with pre-filled text

# Test Copy Link
Click Copy Link → Should show "Copied!" message
Then paste in browser → Should go to store page
```

**Expected Result:** All sharing methods work correctly with proper URLs and pre-filled messages.

---

### ✅ Test 5: Enhanced Footer

**Where to Check:**
- Visit any store page or the home page

**What to Check:**
- [ ] Footer appears at bottom of page
- [ ] Company branding is visible
- [ ] Contact information is displayed correctly
- [ ] Business hours are shown
- [ ] Quick Links section works:
  - [ ] Home link
  - [ ] Browse Stores link
  - [ ] Track Order link
  - [ ] API Documentation link
- [ ] Resources section works:
  - [ ] Agent Login link
  - [ ] Become an Agent link
  - [ ] Contact Support link
  - [ ] Developer API link
- [ ] Copyright year is current (2025)
- [ ] Privacy Policy and Terms links present (even if not implemented yet)
- [ ] Footer is responsive on mobile
- [ ] Footer doesn't overlap with content

**Expected Result:** Professional footer with all links working and proper company information.

---

### ✅ Test 6: Loading States

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Throttle connection to "Slow 3G"
4. Visit a store page

**What to Check:**
- [ ] Skeleton loading appears while products load
- [ ] Skeleton has correct shape matching product cards
- [ ] Skeleton has pulse animation
- [ ] No layout shift when real content loads
- [ ] Loading state is not jarring

**Expected Result:** Smooth loading experience with skeleton screens that match the final layout.

---

## 🎨 Visual Testing

### Check Visual Consistency
- [ ] All gradients match platform color scheme (blue-purple)
- [ ] Cards use glass morphism effect consistently
- [ ] Hover effects are smooth
- [ ] Spacing is consistent
- [ ] Typography hierarchy is clear
- [ ] Colors have good contrast for accessibility

### Test Responsive Design
- [ ] Mobile (< 640px): Stack elements, smaller text, touch-friendly buttons
- [ ] Tablet (640px - 1024px): Side-by-side layouts work
- [ ] Desktop (> 1024px): Full layout with sidebar
- [ ] Test on actual devices if possible

---

## 🐛 Common Issues & Solutions

### Issue: Premium badges not showing
**Solution:** Check that:
- Migration was applied successfully
- Products have `tier = 'premium'` or enhanced features set
- Database columns exist (run verification SQL)

### Issue: API docs page not loading
**Solution:** Check that:
- Dev server is running (`npm run dev`)
- Port 3000 is not in use
- No console errors in browser

### Issue: Sharing not working on mobile
**Solution:** This is expected if native share API is not supported. The fallback (copy link) should work.

### Issue: Footer overlapping content
**Solution:** Check that pages have proper margin-bottom or min-height to allow footer to display.

---

## 📝 Sample Test Data

If you need test data, use this SQL in Supabase:

```sql
-- Get a store ID to use for testing
SELECT id, store_name, store_slug, status 
FROM agent_stores 
WHERE status = 'active' 
LIMIT 1;

-- Get products for testing
SELECT id, store_id, network, capacity, tier, bundle_type
FROM agent_products
WHERE is_active = true
LIMIT 10;

-- Make a product premium for testing
UPDATE agent_products 
SET 
  tier = 'premium',
  bundle_type = 'UP2U',
  priority_processing = true,
  enhanced_reliability = true,
  faster_delivery = true
WHERE id = (SELECT id FROM agent_products LIMIT 1);
```

---

## ✅ Success Criteria

All features are working correctly when:

1. ✅ API docs page loads and all sections are accessible
2. ✅ Premium badges appear on premium products
3. ✅ Network badges appear on products with bundle_type
4. ✅ Sharing buttons work for all methods
5. ✅ Footer displays correctly on all pages
6. ✅ No console errors in browser
7. ✅ No database errors in Supabase logs
8. ✅ Mobile responsive design works
9. ✅ Loading states are smooth

---

## 🎉 Next Steps After Testing

Once everything is tested:

1. **Document any issues found**
2. **Update product tiers in database**
3. **Customize footer content for your brand**
4. **Add actual API credentials** (if not already done)
5. **Deploy to production**
6. **Monitor analytics and user feedback**

---

## 📞 Support

If you encounter issues:
- Check browser console for JavaScript errors
- Check Supabase logs for database errors
- Verify all files were created/modified correctly
- Ensure dev server is running
- Clear browser cache if needed

**Happy Testing! 🚀**

