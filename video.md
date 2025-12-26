# Portfolio Video Gallery - Pending Tasks

### Phase 2: Admin Frontend
- [ ] Add video reordering functionality (drag-to-reorder - optional enhancement)

### Phase 4: Testing & Refinement

#### 4.1 Functional Testing
- [ ] **Video Upload Testing**
  - Test with files: 1MB, 50MB, 100MB, 500MB, >500MB (should reject)
  - Test file types: MP4, WebM, OGG, MOV, AVI (valid)
- [ ] **Video Metadata Management**
  - Test updating titles and display orders
  - Test toggling active/inactive status
- [ ] **Deletion Cleanup**
  - Verify file deletion from disk upon database record removal
  - Verify cascading deletion when portfolio item is removed

#### 4.2 UI/UX Refinement
- [ ] **Mobile Responsiveness**
  - Fine-tune carousel behavior on small screens
  - Ensure video player controls are accessible on touch devices
- [ ] **Reordering Polish**
  - Implement and test drag-to-reorder functionality
- [ ] **LSP & Code Quality**
  - Fix any remaining type errors and lint warnings
