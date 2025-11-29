# Unified Post Creation System - Implementation Guide

This document provides a comprehensive guide to implementing the unified post creation system with integrated media management.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Entry Points                              │
│  • Calendar "Create Post"                                     │
│  • Plans Page                                                 │
│  • Dashboard Quick Create                                     │
│  • Context Menu Actions                                       │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Platform Selector   │  (if no platform selected)
         │      Modal           │
         └──────────┬───────────┘
                    │
                    ▼
         /dashboard/create-post?platforms=facebook,instagram
                    │
                    ▼
         ┌──────────────────────┐
         │  Unified Create Post  │
         │        Page           │
         │  • Platform Tabs      │
         │  • Media Selection    │
         │  • Scheduling         │
         └──────────┬────────────┘
                    │
                    ├─► MediaLibrarySelector (modal)
                    │   ├─► MediaUploader (batch upload)
                    │   └─► Media Grid (selection)
                    │
                    └─► Platform-Specific Composers
                        ├─► FacebookComposer
                        ├─► InstagramComposer (with feed preview)
                        ├─► LinkedInComposer
                        ├─► TwitterComposer
                        ├─► TikTokComposer
                        └─► YouTubeComposer
```

## File Structure

```
/lib
  ├── media-storage.js          ✅ COMPLETED
  └── storage.js                (existing)

/components
  ├── media/
  │   ├── MediaUploader.jsx           ✅ COMPLETED
  │   ├── MediaLibrarySelector.jsx    ⚠️  TO BUILD
  │   ├── MediaGrid.jsx               ⚠️  TO BUILD
  │   └── InstagramFeedPreview.jsx    ⚠️  TO BUILD
  │
  ├── posts/
  │   ├── PlatformSelector.jsx        ⚠️  TO BUILD
  │   └── composers/
  │       ├── FacebookComposer.jsx    (reuse/refine existing)
  │       ├── InstagramComposer.jsx   (reuse/refine existing)
  │       ├── LinkedInComposer.jsx    (reuse/refine existing)
  │       ├── TwitterComposer.jsx     (reuse/refine existing)
  │       ├── TikTokComposer.jsx      (reuse/refine existing)
  │       └── YouTubeComposer.jsx     (reuse/refine existing)
  │
  └── ui/
      └── Modal.jsx                   (existing)

/app/dashboard
  ├── media/
  │   └── page.jsx                    ⚠️  TO BUILD (Media Manager)
  │
  └── create-post/
      └── page.jsx                    ⚠️  TO BUILD (Unified Create Post)
```

## Component Specifications

### 1. MediaLibrarySelector Component

**Location**: `/components/media/MediaLibrarySelector.jsx`

**Purpose**: Reusable modal for selecting media from library

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSelect: (selectedMedia) => void,
  multiSelect: boolean,           // Allow multiple selection
  allowedTypes: string[],          // ['image', 'video']
  maxSelection: number,            // Max files to select
  selectedMedia: array,            // Pre-selected items
}
```

**Features**:
- Grid view of all media in workspace
- Search and filter (by type: images/videos)
- Multi-select with checkboxes
- Shows thumbnail, filename, size, date
- "Upload New" button → Opens MediaUploader inline
- Selected count indicator
- Confirm selection button

**Key UI Elements**:
```javascript
// Styled Components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 800px;
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
`;

const MediaGridContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const MediaCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : 'transparent'};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const SelectionCheckbox = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$checked ? props.theme.colors.primary.main : 'rgba(0,0,0,0.5)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
```

**State Management**:
```javascript
const [mediaFiles, setMediaFiles] = useState([]);
const [selectedIds, setSelectedIds] = useState(new Set());
const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video'
const [searchTerm, setSearchTerm] = useState('');
const [showUploader, setShowUploader] = useState(false);
const [loading, setLoading] = useState(false);
```

**Core Functions**:
```javascript
// Load media files
const loadMedia = async () => {
  setLoading(true);
  try {
    const files = await listMediaFiles(currentWorkspace.id, {
      limit: 100,
      searchTerm,
    });

    // Filter by type
    const filtered = filterType === 'all'
      ? files
      : files.filter(f => getMediaCategory(f.mimeType) === filterType);

    setMediaFiles(filtered);
  } catch (error) {
    showToast.error('Failed to load media');
  } finally {
    setLoading(false);
  }
};

// Toggle selection
const toggleSelect = (fileId) => {
  if (!multiSelect) {
    setSelectedIds(new Set([fileId]));
    return;
  }

  const newSelected = new Set(selectedIds);
  if (newSelected.has(fileId)) {
    newSelected.delete(fileId);
  } else {
    if (maxSelection && newSelected.size >= maxSelection) {
      showToast.error(`Maximum ${maxSelection} files allowed`);
      return;
    }
    newSelected.add(fileId);
  }
  setSelectedIds(newSelected);
};

// Confirm selection
const handleConfirm = () => {
  const selected = mediaFiles.filter(f => selectedIds.has(f.id));
  onSelect(selected);
  onClose();
};

// Handle upload complete
const handleUploadComplete = (results) => {
  setShowUploader(false);
  loadMedia(); // Refresh grid
  showToast.success('Upload complete');
};
```

### 2. Media Manager Page

**Location**: `/app/dashboard/media/page.jsx`

**Purpose**: Dedicated page for managing all media assets

**Layout**:
```javascript
export default function MediaManagerPage() {
  return (
    <Container>
      <PageHeader>
        <Title>Media Library</Title>
        <Actions>
          <SearchInput placeholder="Search media..." />
          <FilterButtons>
            <FilterButton active={filter === 'all'}>All</FilterButton>
            <FilterButton active={filter === 'image'}>Images</FilterButton>
            <FilterButton active={filter === 'video'}>Videos</FilterButton>
          </FilterButtons>
          <Button onClick={() => setShowUploader(true)}>
            <Upload size={20} />
            Upload Media
          </Button>
        </Actions>
      </PageHeader>

      {showUploader && (
        <UploaderSection>
          <MediaUploader
            onUploadComplete={handleUploadComplete}
            multiple={true}
            autoUpload={true}
          />
        </UploaderSection>
      )}

      <MediaGrid>
        {mediaFiles.map(file => (
          <MediaCard key={file.id}>
            <Thumbnail src={file.url} />
            <CardActions>
              <IconButton onClick={() => handleCopyUrl(file.url)}>
                <Copy size={16} />
              </IconButton>
              <IconButton onClick={() => handleDelete(file)}>
                <Trash2 size={16} />
              </IconButton>
            </CardActions>
            <CardInfo>
              <FileName>{file.name}</FileName>
              <FileMetadata>
                {formatFileSize(file.size)} • {getMediaCategory(file.mimeType)}
              </FileMetadata>
            </CardInfo>
          </MediaCard>
        ))}
      </MediaGrid>
    </Container>
  );
}
```

### 3. PlatformSelector Component

**Location**: `/components/posts/PlatformSelector.jsx`

**Purpose**: Modal for selecting platforms before creating a post

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: (selectedPlatforms: string[]) => void,
  preSelected: string[],
  connectedAccounts: array,
}
```

**UI**: Grid of platform cards (similar to AccountSelector), only showing connected accounts

### 4. Unified Create Post Page

**Location**: `/app/dashboard/create-post/page.jsx`

**Key Features**:

1. **Read platform query param**:
```javascript
const searchParams = useSearchParams();
const platformIds = searchParams.get('platforms')?.split(',') || [];
```

2. **Platform tabs**:
```javascript
<PlatformTabs>
  {platformIds.map(platformId => {
    const account = accounts.find(a => a.id === platformId);
    const config = PLATFORM_CONFIG[account.platform];
    return (
      <PlatformTab
        key={platformId}
        active={activePlatform === platformId}
        onClick={() => setActivePlatform(platformId)}
      >
        <Icon />
        {config.name}
      </PlatformTab>
    );
  })}
</PlatformTabs>
```

3. **Layout structure**:
```javascript
<CreatePostContainer>
  <PlatformTabs />

  <ContentArea>
    <MediaSection>
      <MediaPreview media={getCurrentPlatformData().media} />
      <MediaActions>
        <Button onClick={() => setShowLibrary(true)}>
          Select from Library
        </Button>
        <Button onClick={() => setShowUploader(true)}>
          Upload New
        </Button>
      </MediaActions>
    </MediaSection>

    <FieldsSection>
      {/* Render platform-specific composer */}
      {renderPlatformComposer(activePlatform)}
    </FieldsSection>
  </ContentArea>

  <SchedulingSection>
    <PostTimingToggle>
      <Button active={postNow}>Post Now</Button>
      <Button active={!postNow}>Schedule Later</Button>
    </PostTimingToggle>

    {!postNow && (
      <ScheduleInputs>
        <DateInput />
        <TimeInput />
        <TimezoneSelect />
      </ScheduleInputs>
    )}
  </SchedulingSection>

  <ActionButtons>
    <Button variant="ghost">Cancel</Button>
    <Button variant="outline">Save Draft</Button>
    <Button variant="primary">
      {postNow ? 'Post Now' : 'Schedule Post'}
    </Button>
  </ActionButtons>
</CreatePostContainer>
```

### 5. Instagram Feed Preview Component

**Location**: `/components/media/InstagramFeedPreview.jsx`

**Purpose**: Show 3×N grid of Instagram posts with current post as ghost tile

**Props**:
```javascript
{
  accountId: string,
  currentPostMedia: array,  // Media being composed
  existingPosts: array,     // Recent posts for context
}
```

**Layout**:
```javascript
const FeedPreview = styled.div`
  background: ${props => props.theme.colors.neutral[900]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  max-width: 400px;
`;

const PhoneMockup = styled.div`
  border: 8px solid #000;
  border-radius: 32px;
  overflow: hidden;
  background: #fff;
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: #f0f0f0;
`;

const FeedTile = styled.div`
  aspect-ratio: 1;
  background: ${props => props.$isGhost ? `${props.theme.colors.primary.main}20` : '#fff'};
  border: ${props => props.$isGhost ? `2px dashed ${props.theme.colors.primary.main}` : 'none'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const GhostLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.colors.primary.main};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;
```

**Render logic**:
```javascript
const renderGrid = () => {
  // Ghost tile (current post being composed)
  const ghostTile = currentPostMedia.length > 0 ? {
    id: 'ghost',
    mediaUrl: currentPostMedia[0].url,
    isGhost: true,
  } : {
    id: 'ghost',
    isGhost: true,
    isEmpty: true,
  };

  // Combine ghost + existing posts
  const allTiles = [ghostTile, ...existingPosts].slice(0, 30); // Show max 30

  return allTiles.map(post => (
    <FeedTile key={post.id} $isGhost={post.isGhost}>
      {post.isEmpty ? (
        <GhostLabel>New Post</GhostLabel>
      ) : (
        <>
          <img src={post.mediaUrl} alt="" />
          {post.isGhost && <GhostLabel>Preview</GhostLabel>}
        </>
      )}
    </FeedTile>
  ));
};
```

## Platform-Specific Composer Requirements

### Facebook
- **Fields**: Caption, media (single/carousel/video), link preview, hashtags
- **Media rules**: Up to 10 images in carousel, videos up to 240 minutes
- **API**: Use existing `/components/posts/composers/FacebookComposer.jsx` and refine

### Instagram
- **Fields**: Caption, media (feed/reel/story), hashtags, first comment, location, tagged users
- **Media rules**:
  - Feed: 1 image/video or up to 10 carousel
  - Reel: 1 vertical video (9:16), cover frame
- **Special**: Show InstagramFeedPreview component
- **API**: Use existing `/components/posts/composers/InstagramComposer.jsx`

### LinkedIn
- **Fields**: Post text, media (single image/video), link preview, hashtags
- **Media rules**: 1 image or 1 video (up to 10 minutes)

### Twitter/X
- **Fields**: Tweet text (280 chars), media (up to 4 images or 1 video), hashtags
- **Media rules**: Max 4 images, 1 video (up to 140 seconds), 1 GIF

### TikTok
- **Fields**: Video (required), caption, hashtags, sound/audio, cover frame
- **Media rules**: Vertical video (9:16), 15 seconds to 10 minutes

### YouTube
- **Fields**: Video, title, description, thumbnail, tags, playlist, category, visibility, audience
- **Media rules**: Video file + custom thumbnail image

## Data Flow

### Creating a Post

1. User clicks "Create Post" → Navigates to `/dashboard/create-post?platforms=facebook,instagram`
2. Page loads, reads query param, fetches connected accounts
3. User switches between platform tabs (Facebook/Instagram)
4. For each platform:
   - State stored in `platformData[accountId]`
   - Media selected via MediaLibrarySelector
   - Fields filled in platform-specific composer
5. User sets scheduling (Post Now / Schedule Later)
6. Click "Schedule Post" → API call to `/api/posts`:
   ```javascript
   POST /api/posts
   {
     workspace_id: '...',
     platforms: ['facebook_acc_id', 'instagram_acc_id'],
     platform_data: {
       'facebook_acc_id': {
         content: '...',
         media: [...],
         hashtags: [...],
       },
       'instagram_acc_id': {
         content: '...',
         media: [...],
         content_type: 'feed',
       },
     },
     scheduled_for: '2025-01-15T10:00:00Z',
     status: 'scheduled',
     post_now: false,
   }
   ```

### Selecting Media

1. Click "Select from Library" → Opens MediaLibrarySelector modal
2. User browses/searches media grid
3. Clicks media cards to select (checkmarks appear)
4. Click "Confirm Selection" → `onSelect(selectedMedia)` callback
5. Selected media stored in `platformData[activePlatform].media`
6. Preview updates in MediaPreview section

### Uploading Media

1. Click "Upload New" inside MediaLibrarySelector
2. Inline MediaUploader appears
3. User drags/drops files or clicks to browse
4. Files upload with progress bars
5. On complete, grid refreshes to show new media
6. User can immediately select newly uploaded media

## API Endpoints Needed

### GET /api/media
- Returns all media for workspace
- Query params: `workspace_id`, `search`, `type`, `limit`, `offset`

### POST /api/media/upload
- Handles batch media uploads (if not using direct Supabase upload)
- Body: FormData with files

### DELETE /api/media/:id
- Deletes media file from storage and DB

### GET /api/social-accounts/:accountId/posts
- For InstagramFeedPreview: Returns recent posts
- Query params: `limit=30`

## Database Schema Updates

### media_library table (if tracking uploads)
```sql
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration FLOAT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_library_workspace ON media_library(workspace_id);
CREATE INDEX idx_media_library_created ON media_library(created_at DESC);
```

## Routing Updates

Update these entry points to route to unified create-post page:

1. **Calendar** (`/app/dashboard/calendar/page.jsx`):
   ```javascript
   const handleCreateNewPost = (date) => {
     router.push(`/dashboard/create-post?platforms=${platformFilter}&date=${date.toISOString()}`);
   };
   ```

2. **Plans Page** (`/app/dashboard/plans/page.jsx`):
   ```javascript
   <Button onClick={() => router.push('/dashboard/create-post')}>
     Create Post
   </Button>
   ```

3. **Dashboard** quick create button:
   ```javascript
   <Button onClick={() => router.push('/dashboard/create-post')}>
     + Create Post
   </Button>
   ```

## Testing Checklist

- [ ] Create Supabase Storage bucket named "media"
- [ ] Test media upload (single file)
- [ ] Test media upload (batch multiple files)
- [ ] Test media library grid load
- [ ] Test media selection (single and multi)
- [ ] Test media search and filter
- [ ] Test media delete
- [ ] Navigate to create-post with platform preselect
- [ ] Switch between platform tabs
- [ ] Fill in Facebook-specific fields
- [ ] Fill in Instagram-specific fields (with feed preview)
- [ ] Fill in LinkedIn-specific fields
- [ ] Fill in Twitter-specific fields
- [ ] Fill in TikTok-specific fields
- [ ] Fill in YouTube-specific fields
- [ ] Test "Post Now" functionality
- [ ] Test "Schedule Later" with date/time
- [ ] Verify post saves correctly to database
- [ ] Verify Instagram feed preview updates live
- [ ] Test from Content Plan Creator → create-post
- [ ] Test from Calendar → create-post

## Next Steps to Complete Implementation

1. **Create MediaLibrarySelector.jsx** (HIGH PRIORITY)
   - Use Modal component
   - Implement grid, search, filters
   - Add MediaUploader inline
   - Wire up selection logic

2. **Create /dashboard/media/page.jsx** (HIGH PRIORITY)
   - Full media manager interface
   - Use MediaUploader
   - CRUD operations

3. **Create /dashboard/create-post/page.jsx** (HIGH PRIORITY)
   - Platform tabs
   - Layout with media section + fields
   - Integrate MediaLibrarySelector
   - Scheduling section
   - Submit logic

4. **Create InstagramFeedPreview.jsx** (MEDIUM PRIORITY)
   - 3×N grid layout
   - Phone mockup styling
   - Ghost tile logic

5. **Create PlatformSelector.jsx** (MEDIUM PRIORITY)
   - Modal with platform cards
   - Selection logic
   - Redirect to create-post with params

6. **Refine existing platform composers** (LOW PRIORITY)
   - Ensure they work as standalone components
   - Accept props for value/onChange
   - Use MediaLibrarySelector for media

7. **Update routing in Calendar, Plans, Dashboard** (MEDIUM PRIORITY)
   - All "Create Post" actions → `/dashboard/create-post`
   - Pass appropriate query params

## Supabase Storage Setup

In your Supabase dashboard:

1. Go to Storage
2. Create new bucket: `media`
3. Set policies:
   - **SELECT**: Allow authenticated users to read their workspace's files
   - **INSERT**: Allow authenticated users to upload to their workspace folder
   - **DELETE**: Allow authenticated users to delete their workspace's files
4. Make bucket public for easier media serving

Or use SQL:
```sql
-- Create bucket via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Policies
CREATE POLICY "Users can view their workspace media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND auth.uid() IN (
  SELECT user_id FROM workspace_members WHERE workspace_id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Users can upload to their workspace"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.uid() IN (
  SELECT user_id FROM workspace_members WHERE workspace_id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Users can delete their workspace media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.uid() IN (
  SELECT user_id FROM workspace_members WHERE workspace_id::text = (storage.foldername(name))[1]
));
```

## Development Workflow

1. **Phase 1: Foundation**
   - ✅ Media storage utilities
   - ✅ MediaUploader component
   - ⚠️  MediaLibrarySelector component
   - ⚠️  Media Manager page

2. **Phase 2: Core Creation Flow**
   - PlatformSelector modal
   - Unified Create Post page
   - Basic scheduling

3. **Phase 3: Platform-Specific**
   - Refine each platform composer
   - Add Instagram feed preview
   - Add platform validations

4. **Phase 4: Integration**
   - Update Calendar
   - Update Plans
   - Update existing flows

5. **Phase 5: Polish & Testing**
   - E2E testing
   - UI refinements
   - Performance optimization

---

**End of Implementation Guide**
