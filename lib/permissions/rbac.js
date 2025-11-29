/**
 * Role-Based Access Control (RBAC)
 *
 * Define permissions for different roles in workspaces.
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  viewer: 1,
  contributor: 2,
  editor: 3,
  admin: 4,
  owner: 5,
};

// Permission definitions
const PERMISSIONS = {
  // Workspace permissions
  'workspace:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'workspace:update': ['admin', 'owner'],
  'workspace:delete': ['owner'],
  'workspace:settings': ['admin', 'owner'],

  // Member permissions
  'members:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'members:create': ['admin', 'owner'],
  'members:update': ['admin', 'owner'],
  'members:delete': ['admin', 'owner'],

  // Post permissions
  'posts:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'posts:create': ['contributor', 'editor', 'admin', 'owner'],
  'posts:update': ['editor', 'admin', 'owner'],  // Can update any post
  'posts:update:own': ['contributor', 'editor', 'admin', 'owner'],  // Can update own posts
  'posts:delete': ['editor', 'admin', 'owner'],
  'posts:publish': ['editor', 'admin', 'owner'],

  // Media permissions
  'media:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'media:upload': ['contributor', 'editor', 'admin', 'owner'],
  'media:delete': ['editor', 'admin', 'owner'],

  // Analytics permissions
  'analytics:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'analytics:export': ['editor', 'admin', 'owner'],

  // Calendar permissions
  'calendar:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'calendar:manage': ['contributor', 'editor', 'admin', 'owner'],

  // Comment/Approval permissions
  'comments:read': ['viewer', 'contributor', 'editor', 'admin', 'owner'],
  'comments:create': ['contributor', 'editor', 'admin', 'owner'],
  'approvals:request': ['contributor', 'editor', 'admin', 'owner'],
  'approvals:approve': ['editor', 'admin', 'owner'],
};

/**
 * Check if a role has a specific permission
 *
 * @param {string} role - User's role in workspace
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const allowedRoles = PERMISSIONS[permission];

  if (!allowedRoles) {
    console.warn(`Permission "${permission}" not defined`);
    return false;
  }

  return allowedRoles.includes(role);
}

/**
 * Check if a user has permission in a workspace
 *
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} workspaceId - Workspace ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>}
 */
export async function checkPermission(supabase, userId, workspaceId, permission) {
  try {
    // Get user's role in workspace
    const { data: member, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return false;
    }

    return hasPermission(member.role, permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get user's role in a workspace
 *
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {string} workspaceId - Workspace ID
 * @returns {Promise<string|null>}
 */
export async function getUserRole(supabase, userId, workspaceId) {
  try {
    const { data: member, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return null;
    }

    return member.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if user has at least a certain role level
 *
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean}
 */
export function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Get all permissions for a role
 *
 * @param {string} role - Role to get permissions for
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  const rolePermissions = [];

  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      rolePermissions.push(permission);
    }
  }

  return rolePermissions;
}

/**
 * Role display names
 */
export const ROLE_NAMES = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
  owner: 'Full access including workspace deletion and billing',
  admin: 'Manage team members and workspace settings',
  editor: 'Create, edit, publish, and delete posts',
  contributor: 'Create and edit own posts, request approvals',
  viewer: 'View content and analytics, cannot make changes',
};

/**
 * Role colors for UI
 */
export const ROLE_COLORS = {
  owner: '#8B5CF6',     // Purple
  admin: '#EC4899',     // Pink
  editor: '#10B981',    // Green
  contributor: '#F59E0B', // Orange
  viewer: '#6B7280',    // Gray
};
