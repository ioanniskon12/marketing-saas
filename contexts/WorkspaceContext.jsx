/**
 * Workspace Context
 *
 * Global state management for current workspace.
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "../components/auth/AuthProvider";

const WorkspaceContext = createContext({
  currentWorkspace: null,
  workspaces: [],
  socialAccounts: [],
  loading: true,
  setCurrentWorkspace: () => {},
  refreshWorkspaces: () => {},
  refreshSocialAccounts: () => {},
});

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load workspaces
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  // Load current workspace from localStorage
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");

      if (savedWorkspaceId) {
        const saved = workspaces.find((w) => w.id === savedWorkspaceId);
        if (saved) {
          setCurrentWorkspace(saved);
          return;
        }
      }

      // Default to first workspace
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  // Save current workspace to localStorage
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem("currentWorkspaceId", currentWorkspace.id);
    }
  }, [currentWorkspace]);

  // Load social accounts when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadSocialAccounts();
    } else {
      setSocialAccounts([]);
    }
  }, [currentWorkspace]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_id,
          role,
          created_at,
          workspaces (
            id,
            name,
            slug,
            logo_url,
            logo_size,
            owner_id,
            subscription_plan,
            subscription_status,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedWorkspaces = data.map((item) => ({
        id: item.workspaces.id,
        name: item.workspaces.name,
        slug: item.workspaces.slug,
        logo_url: item.workspaces.logo_url,
        logo_size: item.workspaces.logo_size,
        ownerId: item.workspaces.owner_id,
        subscriptionPlan: item.workspaces.subscription_plan,
        subscriptionStatus: item.workspaces.subscription_status,
        role: item.role,
        createdAt: item.workspaces.created_at,
        memberSince: item.created_at,
      }));

      setWorkspaces(formattedWorkspaces);
      return formattedWorkspaces;
    } catch (error) {
      console.error("Error loading workspaces:", error);
      setWorkspaces([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadSocialAccounts = async () => {
    if (!currentWorkspace) return [];

    try {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("workspace_id", currentWorkspace.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedAccounts = data.map((account) => ({
        id: account.id,
        platform: account.platform,
        platformAccountId: account.platform_account_id,
        platformUsername: account.platform_username,
        isActive: account.is_active,
        tokenExpiresAt: account.token_expires_at,
        createdAt: account.created_at,
        updatedAt: account.updated_at,
      }));

      setSocialAccounts(formattedAccounts);
      return formattedAccounts;
    } catch (error) {
      console.error("Error loading social accounts:", error);
      setSocialAccounts([]);
      return [];
    }
  };

  const refreshSocialAccounts = async () => {
    return await loadSocialAccounts();
  };

  const refreshWorkspaces = async () => {
    const updatedWorkspaces = await loadWorkspaces();

    // Update currentWorkspace with fresh data after refresh
    if (currentWorkspace && updatedWorkspaces.length > 0) {
      const updatedWorkspace = updatedWorkspaces.find(w => w.id === currentWorkspace.id);
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
      }
    }
  };

  const handleSetCurrentWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
  };

  const value = {
    currentWorkspace,
    workspaces,
    socialAccounts,
    loading,
    setCurrentWorkspace: handleSetCurrentWorkspace,
    refreshWorkspaces,
    refreshSocialAccounts,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook to use workspace context
 *
 * @returns {Object} Workspace context value
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}

/**
 * Hook to get current workspace or throw error
 *
 * @returns {Object} Current workspace
 */
export function useCurrentWorkspace() {
  const { currentWorkspace, loading } = useWorkspace();

  if (!loading && !currentWorkspace) {
    throw new Error("No workspace selected");
  }

  return currentWorkspace;
}
